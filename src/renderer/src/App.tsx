import { useRef, useState } from 'react'
import VideoUpload from './components/VideoUpload';
import SubtitlePage from './SubtitlePage';
import { SubtitleLine } from './components/SubtitleEditor';

import { v4 as uuidv4 } from 'uuid';

function App(): JSX.Element {

  const [subtitleLines, setSubtitleLines] = useState<SubtitleLine[]>([]);

  window.electron.ipcRenderer.on('on-translated', (_event, text) => {
    console.log('text:', text)
    // subtitleEditorRef.current?.updateSubtitle(text.index, "translation", text.translated_content)
    // setTranscriptions((prevTranscriptions) => [...prevTranscriptions, value])
  })

  function translateAllSubtitles() {
    // const subtitles = subtitleEditorRef.current?.getAllSubtitles();
    console.log(subtitleLines)
    const texts: { index: string; content: string }[] = []
    subtitleLines?.forEach((subtitle) => {
      texts.push({
        index: subtitle.id,
        content: subtitle.text,
      });
    })
    console.log('texts:', texts)

    window.electron.ipcRenderer.send('translate-text', {
      texts: texts,
      language: "英语",
      concurrency: 1,
    })

  }

  function translateSubtitle(index: string, content: string) {
    console.log('index:', index, 'content:', content)
    window.electron.ipcRenderer.send('translate-text', {
      texts: [{
        index: index,
        content: content,
      }],
      language: "英语",
      concurrency: 1,
    })
  }

  const handleAddSubtitle = (subtitle: SubtitleLine) => {
    setSubtitleLines((prev) => [...prev, subtitle]);
  };

  const handleClearAllSubtitles = () => {
    setSubtitleLines([]);
  };


  const stopWhisperHandle = (): void => {
    window.electron.ipcRenderer.send('stop-transcription')
  }


  // const initialSubtitleLines: SubtitleLine[] = [
  //   { id: uuidv4(), startTime: "00:00:00.000", endTime: "00:00:02.000", text: "teníamos una unidad táctica en ese momento.", translation: "中国人" },
  //   { id: uuidv4(), startTime: "00:00:03.000", endTime: "00:00:04.000", text: "Dividimos un país en varias unidades tácticas." },
  //   { id: uuidv4(), startTime: "00:00:04.000", endTime: "00:00:10.000", text: "Y luego comenzamos a dividirnos en divisiones de la empresa internacional." },
  //   { id: uuidv4(), startTime: "00:00:10.000", endTime: "00:00:14.000", text: "Terto, incluso, queríamos dividirnos más." },
  //   { id: uuidv4(), startTime: "00:00:14.000", endTime: "00:00:20.000", text: "Queríamos dividirnos en algo llamado vehículos de combustible y vehículos de energía nueva." },
  //   { id: uuidv4(), startTime: "00:00:20.000", endTime: "00:00:22.000", text: "Así que, en realidad," },
  //   { id: uuidv4(), startTime: "00:00:22.000", endTime: "00:00:27.000", text: "si continuamos dibujando este diagrama podría tener una, dos, tres," },
  // ];

  window.electron.ipcRenderer.on('on-transcribing', (_event, value) => {

    console.log('value:', value)

    // 使用正则表达式来匹配每个字幕项
    // const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s*([\s\S]+?)(?=\n\n|\s*$)/g;
    const regex = /\[(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\] (.+)/g;

    let match: RegExpExecArray | null;

    while ((match = regex.exec(value)) !== null) {
      console.log('=========');
      const startTime = match[1];
      const endTime = match[2];
      const content = match[3].trim();

      const subtitle: SubtitleLine = {
        id: uuidv4(),
        startTime: startTime,
        endTime: endTime,
        text: content
      }

      console.log('subtitle:', subtitle)
      handleAddSubtitle(subtitle);
    }

    if (value === "end") {
      console.log("end")
      return;
    }
    // setTranscriptions((prevTranscriptions) => [...prevTranscriptions, value])
  })

  function handleUpload(file: File): void {
    console.log('file:', file)
    // throw new Error('Function not implemented.');
    const audioFile = file.path
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

  function handleClear(): void {
    // throw new Error('Function not implemented.');
    stopWhisperHandle();
    // setTranscriptions([]);
    handleClearAllSubtitles();
  }


  return (
    <div style={{ padding: '0px' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4">
          <VideoUpload onUpload={handleUpload} onClear={handleClear} width={'100%'} height={'460px'} />
        </div>
        <div className="p-4 h-[calc(100vh-10px)] overflow-y-auto">
          {/* <button
            onClick={translateAllSubtitles}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Translate All
          </button> */}
          {/* <SubtitleEditer ref={subtitleEditorRef} onTranslateAll={translateAllSubtitles} onTranslateSubtitle={translateSubtitle} /> */}
          <SubtitlePage subtitleLines={subtitleLines} setSubtitleLines={setSubtitleLines} />
        </div>
      </div>

    </div>
  )
}

export default App
