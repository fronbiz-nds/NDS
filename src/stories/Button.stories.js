const BUTTON_VARIANTS = {
  '-primary': 'Primary',
  '-secondary': 'Secondary',
  '-tertiary': 'Tertiary',
  '-text': 'Text',
  '-link': 'Link',
  '-ico': 'Icon',
};

const BUTTON_SIZES = {
  '-lg': 'Large',
  '-md': 'Medium',
  '-rg': 'Regular',
  '-sm': 'Small',
  '-xs': 'X-Small',
};

const withSectionWrapper = (title, content, description = '') => `
  <div class="sb-gallery-wrap">
    <h2 class="sb-section-title">${title}</h2>
    ${description ? `<p class="sb-section-description">${description}</p>` : ''}
    ${content}
  </div>
`;

const getCopyHandler = (textToCopy) => {
  const minifiedText = textToCopy.replace(/\s+/g, ' ').trim(); 
  const safeText = minifiedText.replace(/'/g, "\\'").replace(/"/g, '&quot;');

  return `
    event.preventDefault();
    navigator.clipboard.writeText('${safeText}').then(() => {
      const old = document.querySelector('.sb-toast-message');
      if (old) old.remove();

      const toast = document.createElement('div');
      toast.className = 'sb-toast-message';

      Object.assign(toast.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#333333', color: '#ffffff', padding: '12px 24px',
        borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', zIndex: '99999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', opacity: '0',
        transition: 'opacity 0.3s ease, transform 0.3s ease', pointerEvents: 'none'
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

const getBtnTag = (variant, size, label, disabled = false, extraClass = '', style = '', attrs = '') => {
  const classNames = ['nds-ui', 'nds-button', variant, size, extraClass].filter(Boolean).join(' ');
  const props = [`class="${classNames}"`];
  if (style) props.push(`style="${style}"`);
  if (attrs) props.push(attrs);

  if (variant === '-text' || variant === '-link') {
    if (variant === '-text') props.push('type="button"');
    if (!disabled) props.push(`href="javascript:void(0);"`);
    return `<a ${props.join(' ')}>${label}</a>`;
  } else {
    props.push('type="button"');
    if (disabled) props.push('disabled');
    return `<button ${props.join(' ')}>${label}</button>`;
  }
};

const createButtonGallery = (variantKey, variantValue, customLabel = '버튼명', showDisabled = true) => {
  return `
    <div class="sb-button-grid">
      ${Object.entries(BUTTON_SIZES).map(([sizeValue, sizeLabel]) => {
        const defaultTag = getBtnTag(variantValue, sizeValue, customLabel, false, '', '', `title="${customLabel}"`);
        const disabledTag = getBtnTag(variantValue, sizeValue, customLabel, true, '', '', `title="${customLabel} (비활성)"`);
        
        return `
          <div class="sb-gallery-card"> 
            <div class="sb-button-card-inner">
              <div class="sb-hover-effect" style="cursor: pointer;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(defaultTag)}">
                ${defaultTag}
              </div>
              ${showDisabled ? `
              <div class="sb-button-disabled-wrapper" style="pointer-events: auto; cursor: pointer;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(disabledTag)}">
                <div style="pointer-events: none;">${disabledTag}</div>
              </div>` : ''}
            </div>
            <div class="sb-card-footer">
              <span class="sb-label">${variantKey} / ${sizeLabel}</span>
              <code class="sb-code">${variantValue} ${sizeValue}</code>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

const createCTAGallery = () => {
  const commonAttrs = 'title="버튼명"'; 
  const basicFull = `<div class="nds-cta-wrap"> ${getBtnTag('-primary', '-lg', '버튼명', false, '-full', '', commonAttrs)}</div>`;
  const basicFlex5 = `<div class="nds-cta-wrap">${getBtnTag('-tertiary', '-lg', '버튼명', false, '-flex-5', '', commonAttrs)}${getBtnTag('-primary', '-lg', '버튼명', false, '-flex-5', '', commonAttrs)}</div>`;
  const basicFlex37 = `<div class="nds-cta-wrap">${getBtnTag('-tertiary', '-lg', '버튼명', false, '-flex-3', '', commonAttrs)}${getBtnTag('-primary', '-lg', '버튼명', false, '-flex-7', '', commonAttrs)}</div>`;
  const basicDouble = ` <div class="nds-cta-double"> ${getBtnTag('-secondary', '-lg', '버튼명', false, '-full', '', commonAttrs)}${getBtnTag('-primary', '-lg', '버튼명', false, '-full', '', commonAttrs)}</div>`;

  const popupFull = `<div class="nds-cta-wrap">${getBtnTag('-secondary', '-md', '버튼명', false, '-full', '', commonAttrs)}</div>`;
  const popupFlex5 = `<div class="nds-cta-wrap">${getBtnTag('-tertiary', '-md', '버튼명', false, '-flex-5', '', commonAttrs)}${getBtnTag('-secondary', '-md', '버튼명', false, '-flex-5', '', commonAttrs)}</div>`;
  const popupFlex37 = `<div class="nds-cta-wrap">${getBtnTag('-tertiary', '-md', '버튼', false, '-flex-3', '', commonAttrs)}${getBtnTag('-secondary', '-md', '버튼명', false, '-flex-7', '', commonAttrs)}</div>`;

  const items = [
    { label: 'Full Width', basic: basicFull, popup: popupFull },
    { label: '5:5 Ratio', basic: basicFlex5, popup: popupFlex5 },
    { label: '3:7 Ratio', basic: basicFlex37, popup: popupFlex37 },
    { label: 'Double (Vertical)', basic: basicDouble, popup: '' },
  ];

  return `
    <div class="sb-cta-container">
      <div class="sb-cta-header">
        <div class="sb-cta-header-item">Basic</div>
        <div class="sb-cta-header-item">Popup</div>
      </div>
      ${items.map(item => `
        <div class="sb-cta-row">
          <div class="sb-cta-label">${item.label}</div>
          <div style="cursor: pointer; pointer-events: auto;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(item.basic)}" class="sb-cta-card">
            <div class="sb-pointer-none">${item.basic || '<span style="color:#ddd">N/A</span>'}</div>
          </div>
          <div ${item.popup ? `style="cursor: pointer; pointer-events: auto;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(item.popup)}"` : ''} class="sb-cta-card ${!item.popup ? 'is-disabled' : ''}">
             <div class="sb-pointer-none">${item.popup || ''}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  args: { label: '버튼명', variant: '-primary', size: '-md', disabled: false, fullWidth: false },
  argTypes: {
    label: { control: 'text' },
    variant: { control: { type: 'select', labels: BUTTON_VARIANTS }, options: Object.keys(BUTTON_VARIANTS) },
    size: { control: { type: 'select', labels: BUTTON_SIZES }, options: Object.keys(BUTTON_SIZES) },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  render: (args) => {
    const classList = `nds-ui nds-button ${args.variant} ${args.size} ${args.fullWidth ? '-full' : ''}`.trim();
    if (args.variant === '-ico') return `<button type="button" class="${classList}" title="다운로드" aria-label="다운로드"><i class="nds-ui nds-ico -x24 nds-ico-download" aria-hidden="true"></i></button>`;
    return `<button type="button" class="${classList}" ${args.disabled ? 'disabled' : ''} title="${args.label}">${args.label}</button>`;
  }
};

export const BasicPlayground = {
  name: 'Playground',
  argTypes: { variant: { options: ['-primary', '-secondary', '-tertiary'] } }
};

export const PrimaryGallery = {
  name: '🥇 Primary Buttons',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: (args) => withSectionWrapper('Primary Variant', createButtonGallery('Primary', '-primary', args.label))
};

export const SecondaryGallery = {
  name: '🥈 Secondary Buttons',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: (args) => withSectionWrapper('Secondary Variant', createButtonGallery('Secondary', '-secondary', args.label))
};

export const TertiaryGallery = {
  name: '🥉 Tertiary Buttons',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: (args) => withSectionWrapper('Tertiary Variant', createButtonGallery('Tertiary', '-tertiary', args.label))
};

export const TextAndLinkGallery = {
  name: '🔤 Text & Link Buttons',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: (args) => {
    const iconVariations = [
      { title: 'Text Only', label: `${args.label}` },
      { title: 'Leading Icon', label: `<i class="nds-ui nds-ico -x16 nds-ico-arr-left" aria-hidden="true"></i><span>${args.label}</span>` },
      { title: 'Trailing Icon', label: `<span>${args.label}</span><i class="nds-ui nds-ico -x16 nds-ico-arr-right-x16" aria-hidden="true"></i>` },
      { title: 'Both Icons', label: `<i class="nds-ui nds-ico -x16 nds-ico-arr-left" aria-hidden="true"></i><span>${args.label}</span><i class="nds-ui nds-ico -x16 nds-ico-arr-right-x16" aria-hidden="true"></i>` },
    ];
    const linkBtnHtml = getBtnTag('-link', '', '링크 버튼', false, '', '', 'title="링크 버튼"');

    const content = `
      <div class="sb-button-grid">
        ${iconVariations.map(item => {
          const btnHtml = getBtnTag('-text', '', item.label, false, '', '', `title="${args.label}"`);
          return `
          <div class="sb-gallery-card">
            <div class="sb-hover-effect" style="cursor: pointer;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(btnHtml)}">
              ${btnHtml}
            </div>
            <div class="sb-card-footer">
              <span class="sb-label">${item.title}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <h2 class="sb-section-title" style="margin-top: 40px;">Link Variant</h2>
      <div class="sb-padding-20">
        <div class="sb-gallery-card sb-inline-flex">
          <div class="sb-hover-effect" style="cursor: pointer;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(linkBtnHtml)}">
            ${linkBtnHtml}
          </div>
          <div class="sb-card-footer">
            <span class="sb-label">Link</span>
            <span class="sb-code">-link</span>
          </div>
        </div>
      </div>
    `;
    return withSectionWrapper('Text & Link Variant', content);
  }
};

export const IconButtonGallery = {
  name: '💠 Icon Buttons',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    const iconInnerHtml = `<i class="nds-ui nds-ico -x24 nds-ico-download" aria-hidden="true"></i>`;
    const btnHtml = getBtnTag('-ico', '', iconInnerHtml, false, '', '', 'title="다운로드" aria-label="다운로드"');
    
    return `
    <div>
      <h2 class="sb-section-title">Icon Variant</h2>
      <div class="sb-button-grid">
        <div class="sb-gallery-card">
          <div style="cursor: pointer; pointer-events: auto;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(btnHtml)}" class="sb-button-disabled-wrapper">
             <div style="pointer-events: none;">${btnHtml}</div>
          </div>
          <div class="sb-card-footer">
            <span class="sb-label">Icon</span>
            <span class="sb-code">-ico</span>
          </div>
        </div>
      </div>
    </div>`;
  }
};

export const PlusMinusGallery = {
  name: '➕ Plus & Minus Buttons',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    const plusAttrs = 'title="증가" aria-label="증가"';
    const minusAttrs = 'title="감소" aria-label="감소"';

    const plusTag = getBtnTag('-ico', '', '', false, '-plus', '', plusAttrs);
    const minusTag = getBtnTag('-ico', '', '', false, '-minus', '', minusAttrs);
    
    const plusActiveTag = getBtnTag('-ico', '', '', false, '-plus -active', '', plusAttrs);
    const minusActiveTag = getBtnTag('-ico', '', '', false, '-minus -active', '', minusAttrs);

    const btns = [
      { label: 'Plus Default', tag: plusTag, code: '-ico -plus' },
      { label: 'Plus Active', tag: plusActiveTag, code: '-ico -plus -active' },
      { label: 'Minus Default', tag: minusTag, code: '-ico -minus' },
      { label: 'Minus Active', tag: minusActiveTag, code: '-ico -minus -active' },
      { 
        label: 'Usage (Group)', 
        tag: `<div class="nds-control-buttons-wrap">${minusActiveTag}${plusActiveTag}</div>`, 
        code: '.nds-control-buttons-wrap' 
      },
    ];

    return `
    <div>
      <h2 class="sb-section-title">Plus & Minus</h2>
      <div class="sb-button-grid">
        ${btns.map(b => `
        <div class="sb-gallery-card">
          <div style="cursor: pointer; pointer-events: auto;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(b.tag)}" class="sb-button-disabled-wrapper">
            <div style="pointer-events: none; display: flex; justify-content: center;">
              ${b.tag}
            </div>
          </div>
          <div class="sb-card-footer">
            <span class="sb-label">${b.label}</span>
            <code class="sb-code">${b.code}</code>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }
};

export const CTAGallery = {
  name: '📱 CTA Layouts',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => `<div><h2 class="sb-section-title">CTA Patterns</h2>${createCTAGallery()}</div>`
};

export const FloatingButtonGallery = {
  name: '🎈 Floating Button',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
  render: () => {
    const floatHtml = `
<div class="nds-ui nds-floating-button-wrap" style="position: relative; top: auto; right: auto; z-index: 1;">
  <button type="button" class="nds-floating-button"> 
    <span>원금손실<br />가능상품</span> 
  </button>
  <button type="button" class="nds-floating-button-close" title="닫기" aria-label="닫기"></button>
</div>`.trim();

    return `
    <div>
      <h2 class="sb-section-title">Floating Widget</h2>
      <p class="sb-section-description">
        화면 우측 상단 등에 고정(Fixed)되어 노출되는 플로팅 버튼입니다.<br>
        접근성을 위해 메인 컨테이너는 <code>div</code>가 아닌 <code>button</code> 태그 사용을 권장합니다.
      </p>
      
      <div class="sb-button-grid">
        <div class="sb-gallery-card">
          <div class="sb-button-card-inner" style="min-height: 120px; display: flex; align-items: center; justify-content: center;">
            <div class="sb-hover-effect" style="cursor: pointer;" title="클릭하여 HTML 복사" onclick="${getCopyHandler(floatHtml)}">
               ${floatHtml}
            </div>
          </div>
          
          <div class="sb-card-footer">
            <span class="sb-label">Floating Button</span>
            <code class="sb-code">.nds-floating-button</code>
          </div>
        </div>
      </div>
    </div>`;
  }
};