import type { SVGProps, ReactNode } from "react";

type Props = SVGProps<SVGSVGElement>;

function svgWrap(content: ReactNode) {
  return function Icon(props: Props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {content}
      </svg>
    );
  };
}

export const HomeIcon = svgWrap(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </>,
);
export const MapIcon = svgWrap(
  <>
    <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
    <path d="M9 3v16M15 5v16" />
  </>,
);
export const FlashIcon = svgWrap(<path d="M13 2 4 14h6l-2 8 10-12h-6l1-8Z" />);
export const CrowdIcon = svgWrap(
  <>
    <circle cx="8" cy="10" r="3" />
    <circle cx="16" cy="10" r="3" />
    <path d="M2 21c0-3.3 2.7-6 6-6M22 21c0-3.3-2.7-6-6-6M9 21c0-2.2 1.3-4 3-4s3 1.8 3 4" />
  </>,
);
export const UserIcon = svgWrap(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </>,
);
export const BellIcon = svgWrap(
  <>
    <path d="M6 8a6 6 0 1 1 12 0c0 4.5 2 5.5 2 7H4c0-1.5 2-2.5 2-7Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>,
);
export const SparkIcon = svgWrap(
  <>
    <path d="M12 2v6M12 16v6M4.2 4.2l4.3 4.3M15.5 15.5l4.3 4.3M2 12h6M16 12h6M4.2 19.8l4.3-4.3M15.5 8.5l4.3-4.3" />
  </>,
);
export const SearchIcon = svgWrap(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);
export const PinIcon = svgWrap(
  <>
    <path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z" />
    <circle cx="12" cy="9" r="2.5" />
  </>,
);
export const ClockIcon = svgWrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);
export const StarIcon = svgWrap(
  <path d="m12 3 2.8 6 6.7.7-5 4.6 1.4 6.7L12 17.8 6 20l1.4-6.7-5-4.6 6.7-.7L12 3Z" />,
);
export const ChevronIcon = svgWrap(<path d="m9 6 6 6-6 6" />);
export const CheckIcon = svgWrap(<path d="m5 12 4.5 4.5L19 7" />);
export const PlusIcon = svgWrap(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);
export const FilterIcon = svgWrap(<path d="M3 5h18M6 12h12M10 19h4" />);
export const TrendingIcon = svgWrap(
  <>
    <path d="m3 17 6-6 4 4 7-8" />
    <path d="M14 7h6v6" />
  </>,
);
export const HeartIcon = svgWrap(
  <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
);
export const PhoneIcon = svgWrap(
  <path d="M4 5c0 9 6 15 15 15l2-3.5-5-2-2 2c-2.5-1.2-4.5-3.2-5.6-5.6l2-2-2-5L4 5Z" />,
);
export const ShareIcon = svgWrap(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.5 10.5 7-4M8.5 13.5l7 4" />
  </>,
);
export const PhotoIcon = svgWrap(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </>,
);
export const TrashIcon = svgWrap(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </>,
);
export const ChartIcon = svgWrap(
  <>
    <path d="M4 20V6M20 20H4" />
    <path d="M8 16v-4M12 16V9M16 16v-6" />
  </>,
);
