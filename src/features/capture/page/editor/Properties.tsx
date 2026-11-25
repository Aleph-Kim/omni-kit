import { useEffect, useRef, type ReactNode } from 'react'
import { t } from '../../../../i18n'
import { STAMP_ICONS, UI_ICONS } from './icons'
import { NUMBER, type Order } from './items'
import { keyLabel } from './keys'
import { PALETTE } from './palette'
import { SHAPE_LABEL, SHAPES, shapeSvgPath, type ShapeName } from './shapes'
import { Glyph, Tip } from './Toolbar'
import { FONT_FAMILY, type Font, type Item, type Style, type Tool } from './types'

// 도구나 고른 요소마다 속성 카드에 보여 줄 값
const FIELDS: Partial<Record<Tool | Item['kind'], (keyof Style)[]>> = {
  text: ['color', 'font', 'fontSize'],
  arrow: ['color', 'thickness', 'curve'],
  pen: ['color', 'thickness'],
  shape: ['shape', 'color', 'fill', 'thickness'],
  icon: ['color', 'size', 'icon'],
  mosaic: ['strength'],
  blur: ['strength'],
  number: ['color', 'size'],
}

const FONTS: { font: Font; label: string }[] = [
  { font: 'system', label: 'fontSystem' },
  { font: 'serif', label: 'fontSerif' },
  { font: 'mono', label: 'fontMono' },
]
const FONT_SIZES = [16, 24, 32, 48, 64, 96]

type Props = {
  kind: Tool | Item['kind']
  style: Style
  onStyle: (patch: Partial<Style>) => void
  customColors: string[]
  onCustomColor: (field: 'color' | 'fill', color: string) => void
  onOrder?: (order: Order) => void
  onDelete?: () => void
  onResetCrop?: () => void
}

export function Properties({ kind, style, onStyle, customColors, onCustomColor, onOrder, onDelete, onResetCrop }: Props) {
  const fields = FIELDS[kind] ?? []
  if (!fields.length && !onDelete && !onResetCrop) return null
  const rows: ReactNode[] = []

  if (fields.includes('shape')) rows.push(<ShapePicker key="shape" value={style.shape} onChange={(shape) => onStyle({ shape })} />)
  if (fields.includes('color'))
    rows.push(<Swatches key="color" label={t('color')} value={style.color} onChange={(color) => onStyle({ color })} custom={customColors} onCustom={(color) => onCustomColor('color', color)} />)
  if (fields.includes('fill'))
    rows.push(<Swatches key="fill" label={t('fill')} value={style.fill} onChange={(fill) => onStyle({ fill })} custom={customColors} onCustom={(color) => onCustomColor('fill', color)} allowNone />)
  if (fields.includes('thickness'))
    rows.push(
      <label key="thickness" className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1">{t('thickness')}</span>
        <input type="range" min={2} max={30} value={style.thickness} className="w-28 accent-(--ok-accent)" onChange={(event) => onStyle({ thickness: Number(event.target.value) })} />
      </label>,
    )
  if (fields.includes('curve'))
    rows.push(
      <div key="curve" className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1">{t('shapeLabel')}</span>
        <div role="group" aria-label={t('shapeLabel')} className="flex rounded-lg bg-(--ok-fill) p-0.5">
          {[false, true].map((curve) => (
            <button
              key={String(curve)}
              type="button"
              aria-pressed={style.curve === curve}
              className="rounded-md px-2.5 py-0.5 text-(--ok-label-2) aria-pressed:bg-(--ok-cell) aria-pressed:text-(--ok-label) aria-pressed:shadow-sm"
              onClick={() => onStyle({ curve })}
            >
              {t(curve ? 'arrowCurve' : 'arrowStraight')}
            </button>
          ))}
        </div>
      </div>,
    )
  if (fields.includes('font'))
    rows.push(
      <label key="font" className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1">{t('font')}</span>
        <select className={selectClass} value={style.font} onChange={(event) => onStyle({ font: event.target.value as Font })}>
          {FONTS.map(({ font, label }) => (
            <option key={font} value={font} style={{ fontFamily: FONT_FAMILY[font] }}>
              {t(label)}
            </option>
          ))}
        </select>
      </label>,
    )
  if (fields.includes('fontSize'))
    rows.push(
      <label key="fontSize" className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1">{t('fontSize')}</span>
        <select className={selectClass} value={style.fontSize} onChange={(event) => onStyle({ fontSize: Number(event.target.value) })}>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>,
    )
  if (fields.includes('size'))
    rows.push(
      <label key="size" className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1">{t('iconSize')}</span>
        <input type="range" min={24} max={256} step={4} value={Math.round(style.size)} className="w-28 accent-(--ok-accent)" onChange={(event) => onStyle({ size: Number(event.target.value) })} />
      </label>,
    )
  if (fields.includes('strength'))
    rows.push(
      <label key="strength" className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1">{t('maskStrength')}</span>
        <input type="range" min={1} max={10} value={style.strength} className="w-28 accent-(--ok-accent)" onChange={(event) => onStyle({ strength: Number(event.target.value) })} />
      </label>,
    )
  if (fields.includes('icon')) rows.push(<IconPicker key="icon" value={style.icon} onChange={(icon) => onStyle({ icon })} />)
  if (onResetCrop)
    rows.push(
      <button key="crop" type="button" className="w-full px-3 py-2.5 text-start text-(--ok-accent) hover:bg-(--ok-fill)" onClick={onResetCrop}>
        {t('resetCrop')}
      </button>,
    )
  if (onOrder)
    rows.push(
      <div key="order" className="flex items-center gap-3 px-3 py-1.5">
        <span className="flex-1">{t('orderLabel')}</span>
        <div role="group" aria-label={t('orderLabel')} className="flex gap-0.5">
          {ORDERS.map(({ order, label, icon }) => (
            <button
              key={order}
              type="button"
              aria-label={t(label)}
              aria-describedby={`tip-${order}`}
              className="group relative grid size-8 place-items-center rounded-lg hover:bg-(--ok-fill)"
              onClick={() => onOrder(order)}
            >
              <Glyph body={icon} className="size-4" />
              <Tip id={`tip-${order}`} text={t(`${label}Hint`)} placement="below" />
            </button>
          ))}
        </div>
      </div>,
    )
  if (onDelete)
    rows.push(
      <button key="delete" type="button" className="flex w-full items-center gap-3 px-3 py-2.5 text-start text-(--ok-destructive) hover:bg-(--ok-fill)" onClick={onDelete}>
        <span className="flex-1">{t('deleteItem')}</span>
        <kbd dir="ltr" className="font-sans text-(--ok-label-2)">
          {keyLabel('delete')}
        </kbd>
      </button>,
    )

  return (
    <>
      <h2 className="mt-5 mb-1.5 px-3 text-xs text-(--ok-label-2)">{t('propertiesTitle')}</h2>
      <div className="overflow-hidden rounded-xl bg-(--ok-cell)">
        {rows.map((row, index) => (
          <div key={index}>
            {index > 0 && <div className="ms-3 h-px bg-(--ok-fill)" />}
            {row}
          </div>
        ))}
      </div>
    </>
  )
}

const selectClass = 'bg-transparent text-end text-(--ok-label-2) outline-none'

const swatch = 'size-5 rounded-full ring-1 ring-(--ok-label-3) aria-pressed:ring-2 aria-pressed:ring-(--ok-accent) aria-pressed:ring-offset-2 aria-pressed:ring-offset-(--ok-cell)'

const ORDERS: { order: Order; label: string; icon: string }[] = [
  { order: 'front', label: 'orderFront', icon: UI_ICONS.toFront },
  { order: 'forward', label: 'orderForward', icon: UI_ICONS.forward },
  { order: 'backward', label: 'orderBackward', icon: UI_ICONS.backward },
  { order: 'back', label: 'orderBack', icon: UI_ICONS.toBack },
]

// 그리기 색 중 검정, 흰색을 뺀 6개로 만든 무지개
const RAINBOW = `conic-gradient(${[...PALETTE.slice(0, 6), PALETTE[0]!].map(({ value }) => value).join()})`

type SwatchesProps<T> = { label: string; value: T; onChange: (value: T) => void; custom: string[]; onCustom: (color: string) => void; allowNone?: boolean }

function Swatches<T extends string | null>({ label, value, onChange, custom, onCustom, allowNone }: SwatchesProps<T>) {
  return (
    <div role="group" aria-label={label} className="px-3 py-2.5">
      <p className="mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {allowNone && (
          <button
            type="button"
            aria-label={t('noFill')}
            title={t('noFill')}
            aria-pressed={value === null}
            className={`${swatch} bg-[linear-gradient(135deg,transparent_45%,var(--ok-destructive)_45%,var(--ok-destructive)_55%,transparent_55%)]`}
            onClick={() => onChange(null as T)}
          />
        )}
        {PALETTE.map(({ key, value: color }) => (
          <button
            key={color}
            type="button"
            aria-label={t(key)}
            title={t(key)}
            aria-pressed={value === color}
            className={swatch}
            style={{ background: color }}
            onClick={() => onChange(color as T)}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <CustomColor value={value ?? '#000000'} onPick={onCustom} />
        {custom.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            title={color}
            aria-pressed={value === color}
            className={swatch}
            style={{ background: color }}
            onClick={() => onChange(color as T)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * 크롬 색 고르기 창을 여는 무지개 동그라미
 * 창 안에서 끄는 동안 오는 input 이벤트마다 적용하면 되돌리기 기록이 쌓여서, 창을 닫을 때 한 번 오는 change 이벤트로만 적용
 */
function CustomColor({ value, onPick }: { value: string; onPick: (color: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  useEffect(() => {
    const input = ref.current!
    const change = () => onPickRef.current(input.value)
    input.addEventListener('change', change)
    return () => input.removeEventListener('change', change)
  }, [])

  return (
    <label
      title={t('customColor')}
      className={`${swatch} relative cursor-pointer has-focus-visible:ring-2 has-focus-visible:ring-(--ok-accent)`}
      style={{ background: RAINBOW }}
    >
      <input ref={ref} type="color" aria-label={t('customColor')} defaultValue={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} className="absolute inset-0 size-full cursor-pointer opacity-0" />
    </label>
  )
}

function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  const button = 'grid size-8 place-items-center rounded-lg hover:bg-(--ok-fill) aria-pressed:bg-(--ok-fill) aria-pressed:text-(--ok-accent)'
  return (
    <div role="group" aria-label={t('toolIcon')} className="flex flex-wrap gap-1 px-2 py-2">
      <button type="button" aria-label={t('iconNumber')} title={t('iconNumber')} aria-pressed={value === NUMBER} className={button} onClick={() => onChange(NUMBER)}>
        <span className="grid size-5 place-items-center rounded-full bg-current text-[11px] font-bold">
          <span className="text-(--ok-cell)">1</span>
        </span>
      </button>
      {Object.entries(STAMP_ICONS).map(([name, body]) => (
        <button key={name} type="button" aria-label={name} title={name} aria-pressed={value === name} className={button} onClick={() => onChange(name)}>
          <Glyph body={body} />
        </button>
      ))}
    </div>
  )
}

function ShapePicker({ value, onChange }: { value: ShapeName; onChange: (shape: ShapeName) => void }) {
  const button = 'grid size-8 place-items-center rounded-lg hover:bg-(--ok-fill) aria-pressed:bg-(--ok-fill) aria-pressed:text-(--ok-accent)'
  return (
    <div role="group" aria-label={t('shapeLabel')} className="flex flex-wrap gap-1 px-2 py-2">
      {SHAPES.map((shape) => (
        <button key={shape} type="button" aria-label={t(SHAPE_LABEL[shape])} title={t(SHAPE_LABEL[shape])} aria-pressed={value === shape} className={button} onClick={() => onChange(shape)}>
          <Glyph body={`<path d="${shapeSvgPath(shape)}"/>`} />
        </button>
      ))}
    </div>
  )
}
