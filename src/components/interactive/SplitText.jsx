/*
  SplitText used to animate headlines in word by word. Headlines now simply
  appear: the type itself carries the page. Props are kept for call sites.
*/
export default function SplitText({ children, className = '' }) {
  return <span className={`inline ${className}`}>{children}</span>
}
