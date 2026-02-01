import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { clsx } from 'clsx';

interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    formatLabel?: (value: number) => string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step = 1, value, onValueChange, formatLabel }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-2 text-xs font-mono text-zinc-400">
                <span>{formatLabel ? formatLabel(value[0]) : value[0]}</span>
                <span>{formatLabel ? formatLabel(value[1]) : value[1]}</span>
            </div>
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={value}
                max={max}
                min={min}
                step={step}
                onValueChange={(val) => onValueChange(val as [number, number])}
            >
                <Slider.Track className="bg-zinc-800 relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-emerald-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                    className="block w-4 h-4 bg-white border border-zinc-200 shadow-md rounded-full hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-transform hover:scale-110"
                />
                <Slider.Thumb
                    className="block w-4 h-4 bg-white border border-zinc-200 shadow-md rounded-full hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-transform hover:scale-110"
                />
            </Slider.Root>
        </div>
    );
};
