import React, { useEffect, useRef, useState } from 'react';
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import CodeTool from '@editorjs/code';
import ImageTool from '@editorjs/image';
import InlineCode from '@editorjs/inline-code';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';

export interface EditorProps {
  initialData?: string | OutputData;
  placeholder?: string;
  onChange?: (data: OutputData) => void;
  holderId?: string;
}

export default function Editor({
  initialData,
  placeholder = 'Write your thoughts here...',
  onChange,
  holderId = 'editorjs-holder',
}: EditorProps) {
  const ejInstance = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let parsedData: OutputData | undefined;
    if (initialData) {
      if (typeof initialData === 'string') {
        try {
          if (initialData.trim().startsWith('{')) {
            parsedData = JSON.parse(initialData);
          }
        } catch (e) {
          console.warn('Could not parse initialData as Editor.js JSON:', e);
        }
      } else {
        parsedData = initialData;
      }
    }

    if (!ejInstance.current) {
      const editor = new EditorJS({
        holder: holderId,
        placeholder,
        data: parsedData,
        tools: {
          header: {
            class: Header,
            inlineToolbar: ['link', 'bold', 'italic'],
            config: {
              placeholder: 'Enter a heading...',
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered',
            },
          },
          code: {
            class: CodeTool,
            config: {
              placeholder: 'Paste your code here...',
            },
          },
          inlineCode: {
            class: InlineCode,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a meaningful quote...',
              captionPlaceholder: 'Quote Author',
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },
          delimiter: Delimiter,
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: '/api/upload',
              },
              field: 'image',
              types: 'image/*',
            },
          },
        },
        async onChange() {
          if (ejInstance.current) {
            try {
              const content = await ejInstance.current.save();
              (window as any).currentEditorContent = content;
              const hiddenInput = document.getElementById('editor-content-input') as HTMLInputElement | null;
              if (hiddenInput) {
                hiddenInput.value = JSON.stringify(content);
              }
              if (onChange) {
                onChange(content);
              }
            } catch (err) {
              console.error('Editor onChange error:', err);
            }
          }
        },
        onReady() {
          (window as any).editorInstance = editor;
          setIsReady(true);
        },
      });

      ejInstance.current = editor;
    }

    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
      <div
        id={holderId}
        className="prose dark:prose-invert max-w-none min-h-[450px] focus:outline-none"
      />
    </div>
  );
}
