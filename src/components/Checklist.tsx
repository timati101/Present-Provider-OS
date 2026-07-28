interface ChecklistItem {
  id: string;
  text: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  completed: Set<string>;
}

export function Checklist({ items, onToggle, completed }: ChecklistProps) {
  const total = items.length;
  const done = items.filter((i) => completed.has(i.id)).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Implementation Checklist</h3>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
          {done} of {total} complete
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const isDone = completed.has(item.id);
          return (
            <li key={item.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle(item.id)}
                  className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span
                  className={`text-sm leading-relaxed transition ${
                    isDone ? "text-gray-400 line-through" : "text-gray-700"
                  }`}
                >
                  {item.text}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
