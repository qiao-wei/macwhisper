import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useState } from 'react'

function App(): JSX.Element {
  const [transcriptions, setTranscriptions] = useState<string[]>([])

  // const audioFile = "/Users/qiaowei/Downloads/macwhisper/code/resources/tools/output.wav";
  const audioFile = "/Users/qw/Desktop/macwhisper/wav/output.wav";
  const whisperHandle = (): void => {
    window.electron.ipcRenderer.send(
      'transcribe-audio',
      {
        modelSize: 'tiny',
        audioFile: audioFile,
        language: 'auto',
        isUseGPU: false
      }
    )
  }

  window.electron.ipcRenderer.on('on-transcribing', (_event, value) => {
    console.log('value:', value)
    if (value === "end") {
      console.log("end")
      return;
    }
    setTranscriptions((prevTranscriptions) => [...prevTranscriptions, value])
  })

  const stopWhisperHandle = (): void => {
    window.electron.ipcRenderer.send('stop-transcription')
  }

  const translateTextHandle = (): void => {
    window.electron.ipcRenderer.send('translate-text', {
      texts: [
        { index: 1, content: '你好' },
        { index: 2, content: '中国人' },
        { index: 3, content: '你是谁' },
      ],
      language: "英语"
    })
  }
  window.electron.ipcRenderer.on('on-translated', (_event, text) => {
    console.log('text:', text)
    // setTranscriptions((prevTranscriptions) => [...prevTranscriptions, value])
  })

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        {/* <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div> */}
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={whisperHandle}>
            whisper
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={stopWhisperHandle}>
            stop whisper
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={translateTextHandle}>
            翻译文本
          </a>
        </div>
      </div>
      <div className="transcriptions">
        {transcriptions.map((transcription, index) => (
          <p key={index}>{transcription}</p>
        ))}
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
