import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';
import { useConnections } from '@/hooks/useConnections';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, ChevronDown, Trash2, Pencil, CheckSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { TodoWithConnection } from '@/types/todo';

export default function Todos() {
  const { data: todos, isLoading } = useTodos();
  const { data: connections } = useConnections();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingTodo, setEditingTodo] = useState<TodoWithConnection | null>(null);
  const [editText, setEditText] = useState('');

  const pendingTodos = todos?.filter(t => !t.is_completed) || [];
  const completedTodos = todos?.filter(t => t.is_completed) || [];

  const handleAdd = () => {
    if (!newTodoText.trim() || !selectedConnectionId) return;
    createTodo.mutate(
      { text: newTodoText.trim(), connection_id: selectedConnectionId },
      {
        onSuccess: () => {
          setNewTodoText('');
          setSelectedConnectionId('');
          setIsAddOpen(false);
        },
      }
    );
  };

  const handleToggle = (todo: TodoWithConnection) => {
    updateTodo.mutate({ id: todo.id, is_completed: !todo.is_completed });
  };

  const handleDelete = (id: string) => {
    deleteTodo.mutate(id);
  };

  const handleEdit = (todo: TodoWithConnection) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  };

  const handleSaveEdit = () => {
    if (!editingTodo || !editText.trim()) return;
    updateTodo.mutate(
      { id: editingTodo.id, text: editText.trim() },
      { onSuccess: () => setEditingTodo(null) }
    );
  };

  const renderTodoItem = (todo: TodoWithConnection) => (
    <div
      key={todo.id}
      className={cn(
        "group flex items-start gap-3 p-4 bg-card rounded-lg border transition-colors hover:border-accent/50",
        todo.is_completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={todo.is_completed}
        onCheckedChange={() => handleToggle(todo)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", todo.is_completed && "line-through text-muted-foreground")}>
          {todo.text}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Link
            to={`/connection/${todo.connection_id}`}
            className="hover:text-accent transition-colors"
          >
            {todo.connection_name || 'Unknown'}
          </Link>
          <span>·</span>
          <span>
            {todo.is_completed && todo.completed_at
              ? `Completed ${formatDistanceToNow(new Date(todo.completed_at), { addSuffix: true })}`
              : `Added ${formatDistanceToNow(new Date(todo.created_at), { addSuffix: true })}`}
          </span>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(todo)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => handleDelete(todo.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onAddConnection={() => {}} />
      <Navigation />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">TO-DOs</h2>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add TO-DO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add TO-DO</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Input
                    placeholder="What do you need to do?"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <div>
                  <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections?.map((conn) => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.name || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!newTodoText.trim() || !selectedConnectionId || createTodo.isPending}
                  className="w-full"
                >
                  Add TO-DO
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : todos?.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No TO-DOs yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Action items from your conversations will appear here.
              <br />
              Record a voice note or add one manually.
            </p>
            <Button variant="accent" onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add TO-DO
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pendingTodos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Pending ({pendingTodos.length})
                </h3>
                {pendingTodos.map(renderTodoItem)}
              </div>
            )}

            {/* Completed */}
            {completedTodos.length > 0 && (
              <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <span>Completed ({completedTodos.length})</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showCompleted && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {completedTodos.map(renderTodoItem)}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit TO-DO</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
              <Button onClick={handleSaveEdit} disabled={!editText.trim()} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
