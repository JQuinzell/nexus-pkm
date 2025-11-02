import { BrowserWindow, app, ipcMain } from 'electron'
import { spawn } from 'node:child_process'
import path, { join } from 'node:path'
import z from 'zod'
import { SearchResult } from '..'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
    },
  })

  win.loadFile('dist/index.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const matchSchema = z.object({
  type: z.literal('match'),
  data: z.object({
    path: z.object({
      text: z.string(),
    }),
    lines: z.object({
      text: z.string(),
    }),
    line_number: z.number(),
    absolute_offset: z.number(),
    submatches: z.array(
      z.object({
        match: z.object({
          text: z.string(),
        }),
        start: z.number(),
        end: z.number(),
      })
    ),
  }),
})

ipcMain.handle(
  'search',
  async (event, query: string): Promise<SearchResult[]> => {
    return new Promise((resolve, reject) => {
      const results: SearchResult[] = []
      const ripgrep = spawn('rg', [
        query,
        path.join(__dirname, '../../data'),
        '--json',
      ])

      ripgrep.stdout.on('data', (data: Buffer) => {
        data
          .toString()
          .split('\n')
          .filter((line) => line.trim() !== '')
          .forEach((line) => {
            try {
              const result = matchSchema.safeParse(JSON.parse(line))
              if (result.success) {
                results.push(result.data.data)
              }
            } catch (e) {
              console.log(e)
            }
          })
      })

      ripgrep.stderr.on('data', (data) => {
        console.error(`ripgrep stderr: ${data}`)
      })

      ripgrep.on('close', (code) => {
        if (code === 0 || code === 1) {
          // ripgrep exits with 1 if no matches are found, which is not an error for us.
          resolve(results)
        } else {
          reject(new Error(`ripgrep process exited with code ${code}`))
        }
      })

      ripgrep.on('error', (err) => {
        reject(
          new Error(
            `Failed to start ripgrep. Is it installed and in your PATH? Error: ${err.message}`
          )
        )
      })
    })
  }
)
