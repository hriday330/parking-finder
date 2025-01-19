import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch: () => void;
};

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "w-96",
  onSearch,
}: SearchBarProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      
      <Input
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`p-2 border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
      />
      
      <button
        onClick={onSearch} 
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;
