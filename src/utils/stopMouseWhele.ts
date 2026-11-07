export const stopMouseWhele = (event: React.WheelEvent<HTMLElement>) => {
    event.currentTarget.blur();
    event.stopPropagation();
}