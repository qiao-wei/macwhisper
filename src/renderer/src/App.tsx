import { useRef, useState } from 'react'
import VideoUpload from './components/VideoUpload';
import SubtitleEditor, { SubtitleEditorHandle } from './components/SubtitleEditor';
import { Subtitle } from './components/SubtitleEditor/types';
import Versions from './components/Versions';

function App(): JSX.Element {
  // const [transcriptions, setTranscriptions] = useState<string[]>([])
  const subtitleEditorRef = useRef<SubtitleEditorHandle>(null);

  window.electron.ipcRenderer.on('on-translated', (_event, text) => {
    console.log('text:', text)
    subtitleEditorRef.current?.updateSubtitle(text.index,"translation",text.translated_content)
    // setTranscriptions((prevTranscriptions) => [...prevTranscriptions, value])
  })

  function translateAllSubtitles() {
    const subtitles = subtitleEditorRef.current?.getAllSubtitles();
    console.log(subtitles)
    const texts: { index: string; content: string }[] = []
    subtitles?.forEach((subtitle) => {
      texts.push({
        index: subtitle.id,
        content: subtitle.content,
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

  const handleAddSubtitle = (subtitle: Omit<Subtitle, 'id'>) => {
    if (subtitleEditorRef.current) {
      subtitleEditorRef.current.addSubtitle(subtitle);
    }
  };

  const handleClearAllSubtitles = () => {
    if (subtitleEditorRef.current) {
      subtitleEditorRef.current.clearAllSubtitles();
    }
  };


  const stopWhisperHandle = (): void => {
    window.electron.ipcRenderer.send('stop-transcription')
  }


  // function parseSrt(srtContent: string): Subtitle[] {


  //   return subtitles;
  // }

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

      const subtitle: Omit<Subtitle, 'id'> = {
        startTime: startTime,
        endTime: endTime,
        content: content
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
          <SubtitleEditor ref={subtitleEditorRef} onTranslateAll={translateAllSubtitles} onTranslateSubtitle={translateSubtitle} />
        </div>
      </div>

      <Versions></Versions> 
    </div>
  )
}

export default App
