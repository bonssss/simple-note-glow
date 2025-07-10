
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

const NoteEditor = ({ note, onSave, onCancel }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onSave(title.trim(), content.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="hover:bg-orange-100 p-2"
              >
                <ArrowLeft className="h-5 w-5 text-orange-600" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800">
                {note ? 'Edit Note' : 'New Note'}
              </h1>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="hover:bg-gray-100 text-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                disabled={!title.trim() && !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm">
          <div className="p-6">
            {/* Title Input */}
            <Input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-2xl font-semibold border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400 mb-4"
              autoFocus
            />

            {/* Content Textarea */}
            <Textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[400px] text-lg border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd> to save or <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> to cancel</p>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
