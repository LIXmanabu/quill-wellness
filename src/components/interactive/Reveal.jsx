/*
  Reveal used to fade/slide each section in on scroll. That effect is retired
  (scattered entrance motion reads as templated, and it hid content until it
  scrolled into view). It now renders its content plainly; the props are kept
  so existing call sites don't need to change.
*/
export default function Reveal({ children, as: As = 'div', className = '' }) {
  return <As className={className || undefined}>{children}</As>
}
