export default function BarBack({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      color="grey"
      opacity="1"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 5C14.8 5 14.6 5.1 14.4 5.2C14 5.5 13.9 6.1 14.2 6.6L15.1 8H7C6.4 8 6 8.4 6 9C6 9.6 6.4 10 7 10H15.1L14.2 11.4C13.9 11.9 14 12.5 14.4 12.8C14.6 12.9 14.8 13 15 13C15.3 13 15.6 12.9 15.8 12.6L17.8 9.6C17.9 9.4 18 9.2 18 9C18 8.8 17.9 8.6 17.8 8.4L15.8 5.4C15.6 5.1 15.3 5 15 5Z"
        fill="#333333"
      ></path>
      <path
        d="M2.5 0C2.2 0 2 0.2 2 0.5V3H1C0.4 3 0 3.4 0 4V14C0 14.6 0.4 15 1 15H2V17.5C2 17.8 2.2 18 2.5 18C2.8 18 3 17.8 3 17.5V15H4C4.6 15 5 14.6 5 14V4C5 3.4 4.6 3 4 3H3V0.5C3 0.2 2.8 0 2.5 0ZM2 13V5H3V13H2Z"
        fill="#333333"
      ></path>
    </svg>
  )
}
