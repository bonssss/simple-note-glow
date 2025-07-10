
import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import NoteEditor from '@/components/NoteEditor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  // Load notes from Supabase on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error loading notes',
        description: 'Failed to load your notes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    setEditingNote(null);
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = async (title: string, content: string) => {
    try {
      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', editingNote.id);

        if (error) throw error;

        toast({
          title: 'Note updated!',
          description: 'Your note has been successfully updated.',
        });
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert([{ title, content }]);

        if (error) throw error;

        toast({
          title: 'Note created!',
          description: 'Your new note has been saved.',
        });
      }
      
      // Refresh notes from database
      await fetchNotes();
      setIsEditing(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error saving note',
        description: 'Failed to save your note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh notes from database
      await fetchNotes();
      toast({
        title: 'Note deleted',
        description: 'Your note has been permanently deleted.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error deleting note',
        description: 'Failed to delete your note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isEditing) {
    return (
      <NoteEditor
        note={editingNote}
        onSave={handleSaveNote}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              My Notebook
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400/20 bg-white/50"
            />
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No notes match "${searchTerm}"`
                : 'Start by creating your first note!'}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleAddNote}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2 rounded-full transition-all transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="group hover:shadow-lg transition-all duration-200 border-orange-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleEditNote(note)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg line-clamp-1 flex-1">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                        className="h-8 w-8 p-0 hover:bg-orange-100"
                      >
                        <Edit3 className="h-3 w-3 text-orange-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {truncateText(note.content, 120) || 'No content...'}
                  </p>
                  
                  <div className="text-xs text-gray-400">
                    {formatDate(note.updated_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleAddNote}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
