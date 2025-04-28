import React, { useEffect, useState } from 'react';
import tokens from '../utils/tokens.json';
import componentLibrary from '../utils/component-library.json';
import { CopyBlock, dracula } from 'react-code-blocks';
import '../index.css';

interface ColorTokenMap {
  [key: string]: string;
}

interface Token {
  value: string;
  type: string;
}

interface TokenGroup {
  [key: string]: Token;
}

interface TokensData {
  shoplflow: {
    [key: string]: TokenGroup;
  };
}

interface ComponentInfo {
  name: string;
  type: string;
  props: {
    [key: string]: {
      type: string;
      required: boolean;
      description: string;
    };
  };
  styles: {
    [key: string]: string;
  };
  contents: {
    [key: string]: string;
  };
  template: string;
  variants: {
    [key: string]: string;
  };
  requiredProps?: string[];
}

interface ComponentLibrary {
  components: {
    [key: string]: ComponentInfo;
  };
}

const DefaultView = () => {
  const [output, setOutput] = useState<string>('');
  const [colorTokenMap, setColorTokenMap] = useState<ColorTokenMap>({});

  useEffect(() => {
    // 모든 color token을 모은다
    const newColorTokenMap: ColorTokenMap = {};
    const tokensData = tokens as unknown as TokensData;
    const componentLib = componentLibrary as unknown as ComponentLibrary;

    for (const category in tokensData.shoplflow) {
      const group = tokensData.shoplflow[category];
      if (typeof group === 'object') {
        for (const tokenName in group) {
          const token = group[tokenName];
          if (token.type === 'color') {
            newColorTokenMap[tokenName] = token.value;
          }
        }
      }
    }
    setColorTokenMap(newColorTokenMap);

    // Figma 플러그인 메시지 핸들러 설정
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      if (message.type === 'code-generated') {
        setOutput(message.code);
      } else if (message.type === 'error') {
        setOutput(`에러: ${message.message}`);
      }
    };
  }, []);

  const handleGenerate = () => {
    // Figma API를 통해 선택된 노드 가져오기
    parent.postMessage(
      {
        pluginMessage: {
          type: 'generate-code',
        },
      },
      '*'
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Figma to Code
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          선택한 Figma 컴포넌트를 코드로 변환합니다.
        </p>
        <button
          onClick={handleGenerate}
          className="w-full max-w-[200px] mb-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          코드 생성
        </button>
        <div className="relative max-w-2xl mx-auto mt-24">
          <div className="bg-gray-900 text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </span>
              <button
                className="bg-gray-800 code hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md"
                data-clipboard-target="#code">
                Copy
              </button>
              </div>
            <div className="overflow-x-auto">
                <CopyBlock
                text={output}
                language="tsx"
                theme={dracula}
                showLineNumbers={true}
                codeBlock
                customStyle={{
                  padding: '1.25rem',
                  fontSize: '0.875rem',
                  fontFamily: 'JetBrains Mono, Monaco, Menlo, Consolas, monospace',
                  lineHeight: '1.6',
                  margin: '0',
                  background: 'rgb(31 41 55)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultView;
