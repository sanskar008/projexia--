import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { TaskPriority } from "../../contexts/ProjectContext";

interface TaskFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPriorities: TaskPriority[];
  setSelectedPriorities: (priorities: TaskPriority[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedPriorities,
  setSelectedPriorities,
  selectedTags,
  setSelectedTags,
  availableTags,
}) => {
  const priorities: TaskPriority[] = ["urgent", "high", "medium", "low"];

  const togglePriority = (priority: TaskPriority) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== priority));
    } else {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriorities([]);
    setSelectedTags([]);
  };

  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "destructive" as const;
      case "high":
        return "warning" as const;
      case "medium":
        return "secondary" as const;
      case "low":
        return "info" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1.5 h-6 w-6"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Priority
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" size="sm">
                {selectedPriorities.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {priorities.map((priority) => (
            <DropdownMenuCheckboxItem
              key={priority}
              checked={selectedPriorities.includes(priority)}
              onCheckedChange={() => togglePriority(priority)}
            >
              <Badge variant={getPriorityVariant(priority)} className="mr-2">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" size="sm">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTags.length > 0 ? (
            availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No tags available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {(searchTerm ||
        selectedPriorities.length > 0 ||
        selectedTags.length > 0) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default TaskFilter;
