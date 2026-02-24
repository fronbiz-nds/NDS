const COLORS = [
  'gray', 'red', 'orange', 'yellow', 'green', 'blue', 'lightblue', 'skyblue', 'navy'
];

const GRADES = [1, 2, 3, 4, 5, 6];

export default {
  title: 'Components/Label',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Label 컴포넌트는 상태, 등급, 속성 등을 표시할 때 사용합니다.',
      },
    },
  },
  argTypes: {
    text: { control: 'text', description: '라벨 텍스트' },
    type: {
      control: 'radio',
      options: ['line', 'fill', 'grade', 'form'],
      description: '라벨 스타일 타입 (Line/Fill/Grade/Form)',
    },
    color: {
      control: 'select',
      options: COLORS,
      if: { arg: 'type', neq: 'grade' }, 
      description: '라벨 색상 (Line/Fill 전용)',
    },
    gradeLevel: {
      control: 'select',
      options: GRADES,
      if: { arg: 'type', eq: 'grade' }, 
      description: '등급 레벨 (1~6)',
    },
    size: {
      control: 'radio',
      options: ['default', 'lg'],
      description: '사이즈 (Default: Small, lg: Large)',
    },
  },
};

const getCopyHandler = (textToCopy) => {
  const safeText = textToCopy.replace(/"/g, '&quot;');
  return `
    event.preventDefault();
    navigator.clipboard.writeText('${safeText}').then(() => {
      const old = document.querySelector('.sb-toast-message');
      if (old) old.remove();

      const toast = document.createElement('div');
      toast.className = 'sb-toast-message';

      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#333333',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: '99999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        opacity: '0',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: 'none'
      });

      toast.innerHTML = '✅ 복사되었습니다!';
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, -10px)';
      });

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 0)';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    });
  `;
};

const createLabel = ({ text, type, color, gradeLevel, size }) => {
  if (type === 'form') {
    return `<label for="form-component-id" class="nds-ui nds-label -form">${text}</label>`;
  }

  let className = 'nds-ui nds-label';

  if (size === 'lg') className += ' -lg';

  if (type === 'grade') {
    className += ` -grade${gradeLevel}`;
  } else {
    className += ` ${type}-${color}`;
  }

  return `<span class="${className}">${text}</span>`;
};

const withSectionWrapper = (title, content) => `
  <div class="sb-gallery-wrap">
    <h2 class="sb-section-title">${title}</h2>
    ${content}
  </div>
`;

const createCardHtml = (labelHtml, labelText, codeText) => `
  <div class="sb-gallery-card">
    <div class="sb-hover-effect" 
          style="cursor: pointer; display: flex; align-items: center; justify-content: center; height: 60px;" 
          title="클릭하여 HTML 복사" 
          onclick="${getCopyHandler(labelHtml)}">
      ${labelHtml}
    </div>
    <div class="sb-card-footer">
      <span class="sb-label">${labelText}</span>
      <code class="sb-code">${codeText}</code>
    </div>
  </div>
`;
const createLabelGallery = (items) => {
  const renderCards = (currentSize) => {
    return items.map(item => {
      const props = { ...item, size: currentSize };
      const labelHtml = createLabel(props);
      
      let codeText = '';
      if (item.type === 'grade') {
        codeText = `-grade${item.gradeLevel}`;
      } else {
        codeText = `${item.type}-${item.color}`;
      }
      if (currentSize === 'lg') codeText += ' -lg';

      return createCardHtml(labelHtml, item.text, codeText);
    }).join('');
  };

  return `
    <div>
      <h4 style="margin: 10px 0 12px 20px; color:#666; font-size:13px; font-weight:600;">Small (Default)</h4>
      <div class="sb-grid" style="margin-bottom: 30px;">
        ${renderCards('default')}
      </div>

      <h4 style="margin: 10px 0 12px 20px; color:#666; font-size:13px; font-weight:600;">Large (-lg)</h4>
      <div class="sb-grid">
        ${renderCards('lg')}
      </div>
    </div>
  `;
};

const createTextLabelGallery = () => {
  const item = { text: '폼 라벨', type: 'form' };
  const labelHtml = createLabel(item);
  const codeText = '-form';
  
  return `
    <div class="sb-grid">
      ${createCardHtml(labelHtml, 'Text (Form Label)', codeText)}
    </div>
  `;
};

export const Playground = {
  args: {
    text: '라벨',
    type: 'line',
    color: 'blue',
    gradeLevel: 1,
    size: 'default',
  },
  render: (args) => createLabel(args),
};

export const LineStyle = {
  name: '📐 Line Style Labels',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    const items = COLORS.map(color => ({
      text: color.charAt(0).toUpperCase() + color.slice(1),
      type: 'line',
      color: color
    }));
    return withSectionWrapper('Line Style Labels', createLabelGallery(items));
  }
};

export const FillStyle = {
  name: '🎨 Fill Style Labels',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    const items = COLORS.map(color => ({
      text: color.charAt(0).toUpperCase() + color.slice(1),
      type: 'fill',
      color: color
    }));
    return withSectionWrapper('Fill Style Labels', createLabelGallery(items));
  }
};

export const GradeStyle = {
  name: '🏆 Grade Style Labels',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    const items = GRADES.map(level => ({
      text: `Grade ${level}`,
      type: 'grade',
      gradeLevel: level
    }));
    return withSectionWrapper('Grade Style Labels', createLabelGallery(items));
  }
};

export const TextStyle = {
  name: '📝 Text Style Labels',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    return withSectionWrapper('Text Style Labels (Form)', createTextLabelGallery());
  }
};