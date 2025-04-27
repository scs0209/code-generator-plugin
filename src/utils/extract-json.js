import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 컴포넌트 디렉토리 지정
const COMPONENTS_DIR = path.join(__dirname, './src/components');
const TOKENS_PATH = path.join(__dirname, './src/styles/tokens.json');

// 디자인 토큰 로드
let designTokens = {};
try {
  const tokensContent = fs.readFileSync(TOKENS_PATH, 'utf8');
  designTokens = JSON.parse(tokensContent).shoplflow;
  console.log('디자인 토큰 로드 완료');
} catch (e) {
  console.error('디자인 토큰 로드 실패:', e.message);
}

// 토큰 타입별로 가능한 값 추출
function extractTokenValues(tokens, type) {
  const values = new Set();

  function traverse(obj) {
    for (const key in obj) {
      const value = obj[key];
      if (value.type === type) {
        values.add(key);
      } else if (typeof value === 'object') {
        traverse(value);
      }
    }
  }

  traverse(tokens);
  return Array.from(values);
}

// 결과 저장 객체
const componentLibrary = {
  style: 'default',
  components: {},
  tokens: {
    colors: extractTokenValues(designTokens, 'color'),
    spacing: extractTokenValues(designTokens, 'spacing'),
    borderRadius: extractTokenValues(designTokens, 'borderRadius'),
    fontWeights: extractTokenValues(designTokens, 'fontWeights'),
  },
};

// 분석 대상 컴포넌트만 추출
const TARGET_COMPONENTS = ['StackContainer', 'Text', 'Modal', 'ModalContainer'];

// 컴포넌트별 기본 내용 정의
const COMPONENT_CONTENTS = {
  StackContainer: {
    title: 'Stack Container',
    description:
      '요소들을 수직 또는 수평으로 쌓을 수 있는 레이아웃 컴포넌트입니다.',
    note: 'Vertical과 Horizontal 변형을 제공합니다.',
    features: [
      '수직/수평 정렬',
      '간격 조절',
      '정렬 방식 설정',
      '크기 조절',
      '스크롤 영역 설정',
    ],
  },
  Text: {
    title: 'Text',
    description: '텍스트를 표시하는 기본 컴포넌트입니다.',
    note: '다양한 타이포그래피 스타일과 색상을 지원합니다.',
    features: [
      '타이포그래피 설정',
      '색상 설정',
      '줄바꿈 설정',
      '정렬 설정',
      '말줄임 설정',
    ],
  },
  Modal: {
    title: 'Modal',
    description: '컨텐츠를 모달 형태로 표시하는 컴포넌트입니다.',
    note: 'Header, Body, Footer 구조를 제공합니다.',
    features: [
      '다양한 크기 옵션 (XXS부터 XXXL까지)',
      '스크롤 영역 자동 조절',
      '헤더/푸터 옵션',
      '외부 클릭 처리',
      '반응형 크기 조절',
    ],
  },
};

// 컴포넌트별 템플릿 정의
function generateTemplate(componentName, props) {
  switch (componentName) {
    case 'StackContainer':
      return `<StackContainer
  direction="column"
  spacing="spacing08"
  align="center"
  justify="flex-start"
>
  {children}
</StackContainer>`;

    case 'Text':
      return `<Text
  typography="body1_400"
  color="neutral700"
  textAlign="start"
>
  텍스트 내용
</Text>`;

    case 'Modal':
    case 'ModalContainer':
      return `<ModalContainer
  sizeVar="M"
  height={400}
  outsideClick={() => {}}
>
  <ModalHeader>제목</ModalHeader>
  <ModalBody>
    컨텐츠 내용
  </ModalBody>
  <ModalFooter>
    <Button>확인</Button>
  </ModalFooter>
</ModalContainer>`;

    default:
      return '';
  }
}

// 단일 컴포넌트 파일 분석
function analyzeComponentFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path
      .basename(filePath)
      .replace(/\.(tsx|types\.ts)$/, '');
    if (!TARGET_COMPONENTS.includes(componentName)) return;
    console.log('Analyzing component:', componentName);

    // Modal size 상수 추출
    let modalSizeValues = [];
    if (componentName === 'Modal' || componentName === 'ModalContainer') {
      const modalSizeMatch = content.match(
        /export const ModalSize = {([^}]+)}/
      );
      if (modalSizeMatch) {
        const sizeValues = modalSizeMatch[1].matchAll(
          /(\w+):\s*['"]([^'"]+)['"]/g
        );
        for (const match of sizeValues) {
          modalSizeValues.push(match[2]);
        }
      }
    }

    // props 정보 추출
    const props = {};
    const patterns = [
      /(export\s+)?interface\s+(\w+Props)\s*{([^}]+)}/s,
      /(export\s+)?type\s+(\w+Props)\s*=\s*({[^}]+}|[^;]+)/s,
      /(export\s+)?type\s+(\w+Props)<[^>]+>\s*=\s*({[^}]+}|[^;]+)/s,
    ];

    let propsContent = null;
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        propsContent = match[3];
        break;
      }
    }

    if (propsContent) {
      const propMatches = propsContent.matchAll(
        /(\w+)(\??)\s*:\s*([^;\n&|]+)/g
      );
      for (const match of propMatches) {
        const [_, propName, optional, propType] = match;
        props[propName] = {
          type: propType.trim(),
          required: !optional,
          description: '',
        };
      }
    }

    // SizeVariantProps 확인
    if (componentName === 'Modal' || componentName === 'ModalContainer') {
      const sizeVariantMatch = content.match(/SizeVariantProps<([^>]+)>/);
      if (sizeVariantMatch) {
        props['sizeVar'] = {
          type: modalSizeValues.map((v) => `"${v}"`).join(' | '),
          required: false,
          description: '모달의 크기를 설정합니다.',
        };
      }
    }

    // shadcn 스타일의 컴포넌트 정의
    componentLibrary.components[componentName] = {
      name: componentName,
      type: 'ui',
      props,
      styles: extractStyleProperties(props),
      contents: COMPONENT_CONTENTS[componentName] || {
        title: componentName,
        description: `${componentName} 컴포넌트입니다.`,
        note: '',
        features: [],
      },
      template: generateTemplate(componentName, props),
    };

    // Modal size variants 추가
    if (modalSizeValues.length > 0) {
      componentLibrary.components[componentName].variants = {
        size: {
          type: 'string',
          default: 'M',
          values: modalSizeValues,
        },
      };
    }
  } catch (e) {
    console.log(`컴포넌트 분석 실패: ${filePath}`, e.message);
  }
}

// 스타일 속성 추출
function extractStyleProperties(props) {
  const styles = {};

  const styleCategories = {
    layout: [
      'width',
      'height',
      'padding',
      'margin',
      'gap',
      'position',
      'display',
      'flex',
    ],
    typography: [
      'fontSize',
      'fontWeight',
      'lineHeight',
      'letterSpacing',
      'textAlign',
    ],
    colors: ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'],
    borders: ['borderWidth', 'borderStyle', 'borderRadius', 'outline'],
    effects: ['opacity', 'boxShadow', 'transform', 'filter'],
    spacing: ['padding', 'margin', 'gap', 'space'],
    sizing: [
      'width',
      'height',
      'minWidth',
      'maxWidth',
      'minHeight',
      'maxHeight',
    ],
  };

  for (const [category, properties] of Object.entries(styleCategories)) {
    for (const propName of Object.keys(props)) {
      if (
        properties.some((prop) =>
          propName.toLowerCase().includes(prop.toLowerCase())
        )
      ) {
        if (!styles[category]) styles[category] = {};
        styles[category][propName] = {
          type: props[propName].type,
          required: props[propName].required,
          values: props[propName].type.includes('|')
            ? props[propName].type
                .split('|')
                .map((v) => v.trim().replace(/['"]/g, ''))
            : null,
        };
      }
    }
  }

  return styles;
}

// 변형 추출
function extractVariants(props) {
  const variants = {};

  const variantProps = ['variant', 'size', 'color', 'style'];

  for (const propName of Object.keys(props)) {
    for (const variantProp of variantProps) {
      if (propName.toLowerCase().includes(variantProp)) {
        const values = props[propName].type.includes('|')
          ? props[propName].type
              .split('|')
              .map((v) => v.trim().replace(/['"]/g, ''))
          : null;

        if (values) {
          variants[variantProp] = {
            type: props[propName].type,
            default: values[0], // 첫 번째 값을 기본값으로
            values: values,
          };
        }
      }
    }
  }

  return variants;
}

// 디렉토리 재귀적 탐색
function analyzeDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        if (item !== 'node_modules' && item !== '.git') {
          analyzeDirectory(itemPath);
        }
      } else if (stats.isFile()) {
        if (
          (item.endsWith('.tsx') || item.endsWith('.types.ts')) &&
          !item.endsWith('.stories.tsx') &&
          item !== 'index.tsx'
        ) {
          analyzeComponentFile(itemPath);
        }
      }
    }
  } catch (e) {
    console.log(`디렉토리 읽기 실패: ${dirPath}`, e.message);
  }
}

// 컴포넌트 분석 시작
function analyzeComponents() {
  analyzeDirectory(COMPONENTS_DIR);

  // JSON 파일로 저장
  fs.writeFileSync(
    path.join(__dirname, 'component-library.json'),
    JSON.stringify(componentLibrary, null, 2)
  );

  console.log(
    `분석 완료: ${
      Object.keys(componentLibrary.components).length
    } 컴포넌트를 분석했습니다.`
  );
}

analyzeComponents();
