import { Pixelated_alien_creature } from "./icons/Pixelated_alien_creature";

export function AlienButton() {
  return (
    <button
      type="button"
      tabIndex={-1}
      className="absolute right-[-16px] bottom-[-13px] w-[80px] h-[80px] -scale-x-100 border-0 bg-transparent p-0 outline-none hide-focus-ring cursor-default pointer-events-none [&_path:not([fill-opacity='0'])]:pointer-events-auto"
    >
      <div className="w-full h-full [&>svg]:animate-fade-in">
        <Pixelated_alien_creature />
      </div>
    </button>
  );
}
