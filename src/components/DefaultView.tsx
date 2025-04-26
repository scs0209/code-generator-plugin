import React, { useEffect, useState } from 'react';
import tokens from '../utils/tokens.json';
import componentLibrary from '../utils/component-library.json';

interface ColorTokenMap {
  [key: string]: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
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
      console.log(category);
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

  console.log(output);

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          padding: '24px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '16px',
          }}
        >
          Figma to Code
        </h1>
        <p
          style={{
            color: '#666',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          선택한 Figma 컴포넌트를 코드로 변환합니다.
        </p>
        <button
          onClick={handleGenerate}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            marginBottom: '24px',
            width: '100%',
            maxWidth: '200px',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#2563eb')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = '#3b82f6')
          }
        >
          코드 생성
        </button>
        <textarea
          value={output}
          readOnly
          style={{
            width: '100%',
            height: '400px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>
    </div>
  );
};

export default DefaultView;
