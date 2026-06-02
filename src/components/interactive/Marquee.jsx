export default function Marquee({
  items = [],
  speed = 'normal',
  reverse = false,
  separator = '·',
  className = '',
  itemClassName = '',
  separatorClassName = '',
}) {
  const speedClass = {
    slow: 'animate-marquee-slow',
    normal: 'animate-marquee',
    fast: 'animate-marquee',
  }[speed] || 'animate-marquee'

  const animClass = reverse ? 'animate-marquee-reverse' : speedClass

  // Duplicate content for seamless loop
  const renderRow = (key) => (
    <div key={key} className="flex items-center gap-8 sm:gap-12 px-4 sm:px-6 flex-shrink-0">
      {items.map((item, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-8 sm:gap-12 flex-shrink-0">
          <span className={itemClassName}>{item}</span>
          <span className={`text-ink-soft/40 flex-shrink-0 ${separatorClassName}`} aria-hidden>{separator}</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`marquee-track ${animClass}`}>
        {renderRow('a')}
        {renderRow('b')}
      </div>
    </div>
  )
}
