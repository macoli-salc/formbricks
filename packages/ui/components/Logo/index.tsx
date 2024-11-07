import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-[0.625rem] ${className}`}>
      <LogoIcon height={32} width={32} />
      <span className="text-text-primary dark:text-text-primary-dark text-xl font-bold">Escuta AI</span>
    </div>
  );
};
interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const LogoIcon: React.FC<IconProps> = ({ width = 38, height = 38, className = "" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <g filter="url(#filter0_ddiii_21002_204224)">
        <path
          d="M3 12.8C3 8.31958 3 6.07937 3.87195 4.36808C4.63893 2.86278 5.86278 1.63893 7.36808 0.871948C9.07937 0 11.3196 0 15.8 0H22.2C26.6804 0 28.9206 0 30.6319 0.871948C32.1372 1.63893 33.3611 2.86278 34.1281 4.36808C35 6.07937 35 8.31958 35 12.8V19.2C35 23.6804 35 25.9206 34.1281 27.6319C33.3611 29.1372 32.1372 30.3611 30.6319 31.1281C28.9206 32 26.6804 32 22.2 32H15.8C11.3196 32 9.07937 32 7.36808 31.1281C5.86278 30.3611 4.63893 29.1372 3.87195 27.6319C3 25.9206 3 23.6804 3 19.2V12.8Z"
          fill="#E93D82"
        />
        <path
          d="M3.75 12.8C3.75 10.5474 3.75058 8.90308 3.8565 7.60669C3.96171 6.31905 4.16708 5.44087 4.5402 4.70857C5.23528 3.34439 6.34439 2.23528 7.70857 1.5402C8.44087 1.16708 9.31905 0.961707 10.6067 0.856503C11.9031 0.750583 13.5474 0.75 15.8 0.75H22.2C24.4526 0.75 26.0969 0.750583 27.3933 0.856503C28.6809 0.961707 29.5591 1.16708 30.2914 1.5402C31.6556 2.23528 32.7647 3.34439 33.4598 4.70857C33.8329 5.44087 34.0383 6.31905 34.1435 7.60669C34.2494 8.90308 34.25 10.5474 34.25 12.8V19.2C34.25 21.4526 34.2494 23.0969 34.1435 24.3933C34.0383 25.6809 33.8329 26.5591 33.4598 27.2914C32.7647 28.6556 31.6556 29.7647 30.2914 30.4598C29.5591 30.8329 28.6809 31.0383 27.3933 31.1435C26.0969 31.2494 24.4526 31.25 22.2 31.25H15.8C13.5474 31.25 11.9031 31.2494 10.6067 31.1435C9.31905 31.0383 8.44087 30.8329 7.70857 30.4598C6.34439 29.7647 5.23528 28.6556 4.5402 27.2914C4.16708 26.5591 3.96171 25.6809 3.8565 24.3933C3.75058 23.0969 3.75 21.4526 3.75 19.2V12.8Z"
          stroke="url(#paint0_linear_21002_204224)"
          strokeWidth="1.5"
        />
        <path
          opacity="0.6"
          d="M17.4 18.4003H19.8C21.125 18.4003 22.2 17.3253 22.2 16.0003V12.8003H25.4C26.2825 12.8003 27 13.5178 27 14.4003V19.2003C27 20.0828 26.2825 20.8003 25.4 20.8003H24.6V22.0003C24.6 22.1528 24.515 22.2903 24.38 22.3578C24.245 22.4253 24.0825 22.4103 23.96 22.3203L21.9325 20.8003H19C18.1175 20.8003 17.4 20.0828 17.4 19.2003V18.4003Z"
          fill="url(#paint1_linear_21002_204224)"
        />
        <path
          d="M11 11.2003C11 10.3178 11.7175 9.60028 12.6 9.60028H19.8C20.6825 9.60028 21.4 10.3178 21.4 11.2003V16.0003C21.4 16.8828 20.6825 17.6003 19.8 17.6003H16.0675L14.04 19.1203C13.92 19.2103 13.7575 19.2253 13.62 19.1578C13.4825 19.0903 13.4 18.9528 13.4 18.8003V17.6003H12.6C11.7175 17.6003 11 16.8828 11 16.0003V11.2003Z"
          fill="url(#paint2_linear_21002_204224)"
        />
      </g>
      <defs>
        <filter
          id="filter0_ddiii_21002_204224"
          x="0"
          y="-3"
          width="38"
          height="41"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.913725 0 0 0 0 0.239216 0 0 0 0 0.509804 0 0 0 0.08 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_21002_204224" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="erode"
            in="SourceAlpha"
            result="effect2_dropShadow_21002_204224"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.913725 0 0 0 0 0.239216 0 0 0 0 0.509804 0 0 0 0.14 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_21002_204224"
            result="effect2_dropShadow_21002_204224"
          />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_21002_204224" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.913725 0 0 0 0 0.239216 0 0 0 0 0.509804 0 0 0 0.1 0"
          />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow_21002_204224" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
          <feBlend
            mode="normal"
            in2="effect3_innerShadow_21002_204224"
            result="effect4_innerShadow_21002_204224"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="erode"
            in="SourceAlpha"
            result="effect5_innerShadow_21002_204224"
          />
          <feOffset />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.913725 0 0 0 0 0.239216 0 0 0 0 0.509804 0 0 0 0.24 0"
          />
          <feBlend
            mode="normal"
            in2="effect4_innerShadow_21002_204224"
            result="effect5_innerShadow_21002_204224"
          />
        </filter>
        <linearGradient
          id="paint0_linear_21002_204224"
          x1="19"
          y1="0"
          x2="19"
          y2="32"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.12" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_21002_204224"
          x1="22.2"
          y1="12.8003"
          x2="22.2"
          y2="22.3997"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_21002_204224"
          x1="16.2"
          y1="9.60028"
          x2="16.2"
          y2="19.1997"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
};
