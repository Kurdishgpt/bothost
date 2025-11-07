import { AddBotDialog } from "../AddBotDialog";

export default function AddBotDialogExample() {
  return (
    <div className="p-8">
      <AddBotDialog
        onAddBot={(bot) => console.log("Adding bot:", bot)}
      />
    </div>
  );
}
