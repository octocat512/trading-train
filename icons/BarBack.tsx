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
        d="M3 5C2.7 5 2.4 5.1 2.2 5.4L0.2 8.4C0.1 8.6 0 8.8 0 9C0 9.2 0.1 9.4 0.2 9.6L2.2 12.6C2.4 12.9 2.7 13 3 13C3.2 13 3.4 12.9 3.6 12.8C4 12.5 4.1 11.9 3.8 11.4L2.9 10H11C11.6 10 12 9.6 12 9C12 8.4 11.6 8 11 8H2.9L3.8 6.6C4.1 6.1 4 5.5 3.6 5.2C3.4 5.1 3.2 5 3 5Z"
        fill="#2B3039"
      ></path>
      <path
        d="M15.5 0C15.2 0 15 0.2 15 0.5V3H14C13.4 3 13 3.4 13 4V14C13 14.6 13.4 15 14 15H15V17.5C15 17.8 15.2 18 15.5 18C15.8 18 16 17.8 16 17.5V15H17C17.6 15 18 14.6 18 14V4C18 3.4 17.6 3 17 3H16V0.5C16 0.2 15.8 0 15.5 0ZM15 13V5H16V13H15Z"
        fill="#333333"
      ></path>
    </svg>
  )
}
