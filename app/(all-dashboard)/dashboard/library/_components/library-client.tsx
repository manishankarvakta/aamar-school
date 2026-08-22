'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  SearchIcon,
  BookOpenIcon,
  RotateCcwIcon,
  CalendarIcon,
  TrashIcon,
  MoreVerticalIcon,
  BookIcon,
  UserIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react';
import { addBook, deleteBook, issueBook, returnBook } from '@/app/actions/library';
import { useBranch } from '@/contexts/branch-context';
import { useUser } from '@/contexts/user-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  quantity: number;
  available: number;
}

interface Borrowing {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  className: string;
  avatar: string;
  borrowDate: string;
  returnDate: string | null;
  dueDate: string;
}

interface Student {
  id: string;
  name: string;
  className: string;
  rollNumber: string;
}

interface LibraryClientProps {
  initialData: {
    books: Book[];
    borrowings: Borrowing[];
    students: Student[];
  };
}

export function LibraryClient({ initialData }: LibraryClientProps) {
  const [books, setBooks] = useState<Book[]>(initialData.books);
  const [borrowings, setBorrowings] = useState<Borrowing[]>(initialData.borrowings);
  const [students] = useState<Student[]>(initialData.students);

  const { hasPermission, isAdmin, loading } = useUser();

  const showCatalog = isAdmin || hasPermission('library', 'view');
  const showBorrowings = isAdmin || hasPermission('library', 'create');
  const showReports = isAdmin || hasPermission('library', 'view');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('books');

  useEffect(() => {
    if (!loading) {
      if (isAdmin || hasPermission('library', 'view')) {
        setSelectedTab('books');
      } else if (hasPermission('library', 'create')) {
        setSelectedTab('borrowed');
      }
    }
  }, [loading, isAdmin, hasPermission]);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Dialog visibility states
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);

  // Form states
  const [addBookTitle, setAddBookTitle] = useState('');
  const [addBookAuthor, setAddBookAuthor] = useState('');
  const [addBookIsbn, setAddBookIsbn] = useState('');
  const [addBookQuantity, setAddBookQuantity] = useState('1');

  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueBookId, setIssueBookId] = useState('');

  // ─── Calculate statistics dynamically ───────────────────────────────
  const currentDateStr = new Date().toISOString().split('T')[0];

  const totalBooksCount = books.reduce((acc, b) => acc + b.quantity, 0);
  const availableBooksCount = books.reduce((acc, b) => acc + b.available, 0);
  const activeBorrowingsCount = borrowings.filter((br) => br.returnDate === null).length;
  
  const overdueBorrowingsCount = borrowings.filter((br) => {
    return br.returnDate === null && br.dueDate < currentDateStr;
  }).length;

  const stats = [
    { title: 'Total Copies', value: totalBooksCount.toLocaleString(), icon: BookIcon, color: 'blue' },
    { title: 'Available Books', value: availableBooksCount.toLocaleString(), icon: BookOpenIcon, color: 'green' },
    { title: 'Borrowed Books', value: activeBorrowingsCount.toLocaleString(), icon: UserIcon, color: 'yellow' },
    { title: 'Overdue Books', value: overdueBorrowingsCount.toLocaleString(), icon: AlertCircleIcon, color: 'red' },
  ];

  // ─── Filter logic ──────────────────────────────────────────────────
  const filteredBooks = books.filter((book) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.isbn.includes(searchLower)
    );
  });

  const filteredBorrowings = borrowings.filter((br) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      br.bookTitle.toLowerCase().includes(searchLower) ||
      br.studentName.toLowerCase().includes(searchLower) ||
      br.studentRoll.includes(searchLower)
    );
  });

  const getBorrowingStatus = (item: Borrowing) => {
    if (item.returnDate) return 'Returned';
    if (item.dueDate < currentDateStr) return 'Overdue';
    return 'Borrowed';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Returned':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80">Returned</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80">Overdue</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80">Borrowed</Badge>;
    }
  };

  const calculateFine = (item: Borrowing) => {
    if (item.returnDate || item.dueDate >= currentDateStr) return 0;
    const due = new Date(item.dueDate);
    const today = new Date(currentDateStr);
    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 5; // 5 BDT per day fine
  };

  // ─── Actions handlers ──────────────────────────────────────────────
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBookTitle.trim() || !addBookAuthor.trim() || !addBookIsbn.trim() || !addBookQuantity) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const response = await addBook({
        title: addBookTitle,
        author: addBookAuthor,
        isbn: addBookIsbn,
        quantity: parseInt(addBookQuantity),
      });

      if (response.success && response.data) {
        toast({
          title: 'Book Added',
          description: `Successfully added "${addBookTitle}" to the library catalog.`,
        });
        setBooks((prev) => [
          ...prev,
          {
            id: response.data.id,
            title: response.data.title,
            author: response.data.author,
            isbn: response.data.isbn,
            quantity: response.data.quantity,
            available: response.data.available,
          },
        ]);
        setAddBookTitle('');
        setAddBookAuthor('');
        setAddBookIsbn('');
        setAddBookQuantity('1');
        setShowAddBookDialog(false);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to add book.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the library?`)) return;

    startTransition(async () => {
      const response = await deleteBook(id);
      if (response.success) {
        toast({
          title: 'Book Removed',
          description: `Successfully removed "${title}" from the catalog.`,
        });
        setBooks((prev) => prev.filter((b) => b.id !== id));
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to remove book.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueStudentId || !issueBookId) {
      toast({
        title: 'Error',
        description: 'Please select both a student and a book.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const response = await issueBook({
        studentId: issueStudentId,
        bookId: issueBookId,
      });

      if (response.success && response.data) {
        const student = students.find((s) => s.id === issueStudentId);
        const book = books.find((b) => b.id === issueBookId);

        toast({
          title: 'Book Issued',
          description: `Successfully issued book to ${student?.name}.`,
        });

        // Update book available quantity locally
        setBooks((prev) =>
          prev.map((b) => (b.id === issueBookId ? { ...b, available: b.available - 1 } : b))
        );

        // Add to borrowings list locally
        const newBorrowing: Borrowing = {
          id: response.data.id,
          bookId: issueBookId,
          bookTitle: book?.title || 'Unknown Book',
          studentId: issueStudentId,
          studentRoll: student?.rollNumber || '',
          studentName: student?.name || 'Unknown Student',
          className: student?.className || 'N/A',
          avatar: '',
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: null,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        setBorrowings((prev) => [newBorrowing, ...prev]);
        setIssueStudentId('');
        setIssueBookId('');
        setShowIssueDialog(false);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to issue book.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleReturnBook = async (borrowingId: string, bookTitle: string) => {
    startTransition(async () => {
      const response = await returnBook(borrowingId);
      if (response.success) {
        toast({
          title: 'Book Returned',
          description: `Successfully returned "${bookTitle}".`,
        });

        const borrowingObj = borrowings.find((br) => br.id === borrowingId);
        if (borrowingObj) {
          // Increment book available copies locally
          setBooks((prev) =>
            prev.map((b) =>
              b.id === borrowingObj.bookId ? { ...b, available: Math.min(b.available + 1, b.quantity) } : b
            )
          );
        }

        // Update return date locally
        setBorrowings((prev) =>
          prev.map((br) =>
            br.id === borrowingId ? { ...br, returnDate: new Date().toISOString().split('T')[0] } : br
          )
        );
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to process return.',
          variant: 'destructive',
        });
      }
    });
  };

  const visibleTabsCount = (showCatalog ? 1 : 0) + (showBorrowings ? 1 : 0) + (showReports ? 1 : 0);
  const gridColsClass = 
    visibleTabsCount === 3 ? "grid-cols-3" : 
    visibleTabsCount === 2 ? "grid-cols-2" : 
    "grid-cols-1";

  return (
    <div className="space-y-6 pb-[150px] p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Library Management
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Manage books, track book borrowings, and oversee library member accounts.
          </p>
        </div>
        <div className="flex gap-2.5">
          {(isAdmin || hasPermission('library', 'edit')) && (
            <Button onClick={() => setShowAddBookDialog(true)} className="gap-2 shadow-sm font-semibold">
              <PlusIcon className="h-4.5 w-4.5" />
              Add Book
            </Button>
          )}
          {(isAdmin || hasPermission('library', 'create')) && (
            <Button onClick={() => setShowIssueDialog(true)} variant="outline" className="gap-2 shadow-sm font-semibold">
              <BookOpenIcon className="h-4.5 w-4.5 text-primary" />
              Issue Book
            </Button>
          )}
        </div>
      </div>

      {/* Statistics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border border-slate-100 hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1.5">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100/60`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter controls */}
      <Card className="shadow-sm border border-slate-100">
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder={selectedTab === 'books' ? "Search books by title, author, or ISBN..." : "Search borrowings by book, student name, or roll..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Sections */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        {visibleTabsCount > 0 && (
          <TabsList className={cn("grid w-full max-w-md", gridColsClass)}>
            {showCatalog && <TabsTrigger value="books">Catalog</TabsTrigger>}
            {showBorrowings && <TabsTrigger value="borrowed">Borrowings</TabsTrigger>}
            {showReports && <TabsTrigger value="reports">Overview Reports</TabsTrigger>}
          </TabsList>
        )}

        {/* Tab 1: Books Catalog */}
        {showCatalog && (
          <TabsContent value="books" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead className="w-[300px]">Book Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Copies (Available)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                        📖 No books found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((book) => (
                      <TableRow key={book.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-800">{book.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">ISBN: {book.isbn}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-650">{book.author}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-bold text-slate-800">{book.available}</span>
                            <span className="text-muted-foreground"> / {book.quantity} copies</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {(isAdmin || hasPermission('library', 'create') || hasPermission('library', 'edit')) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(isAdmin || hasPermission('library', 'create')) && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setIssueBookId(book.id);
                                      setShowIssueDialog(true);
                                    }}
                                    disabled={book.available <= 0}
                                  >
                                    <BookOpenIcon className="h-4 w-4 mr-2 text-slate-500" />
                                    Issue Book
                                  </DropdownMenuItem>
                                )}
                                {(isAdmin || hasPermission('library', 'edit')) && (
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-700"
                                    onClick={() => handleDeleteBook(book.id, book.title)}
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Delete Book
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Tab 2: Borrowings */}
        {showBorrowings && (
          <TabsContent value="borrowed" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                        🤝 No borrowing records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBorrowings.map((item) => {
                      const status = getBorrowingStatus(item);
                      const fine = calculateFine(item);
                      return (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.avatar} />
                                <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                                  {item.studentName.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800">{item.studentName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.className} • Roll: {item.studentRoll}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">{item.bookTitle}</TableCell>
                          <TableCell className="text-slate-600 text-sm">{item.borrowDate}</TableCell>
                          <TableCell className="text-slate-600 text-sm">{item.dueDate}</TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell>
                            {fine > 0 ? (
                              <span className="text-red-650 font-bold">৳{fine}</span>
                            ) : (
                              <span className="text-green-600 text-sm font-medium">No Fine</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {status !== 'Returned' && (isAdmin || hasPermission('library', 'create')) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVerticalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleReturnBook(item.id, item.bookTitle)}>
                                    <RotateCcwIcon className="h-4 w-4 mr-2 text-slate-500" />
                                    Return Book
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Tab 3: Simple reports */}
        {showReports && (
          <TabsContent value="reports" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow border border-slate-100">
              <CardHeader>
                <CardTitle className="text-base font-bold">Popular Books</CardTitle>
                <CardDescription>Most frequently checked out books.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {books.slice(0, 3).map((book) => {
                    const borrowedCount = borrowings.filter((br) => br.bookId === book.id).length;
                    return (
                      <div key={book.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{book.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {borrowedCount} times
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow border border-slate-100">
              <CardHeader>
                <CardTitle className="text-base font-bold">Quick Reminders</CardTitle>
                <CardDescription>Actions and notices for overdue items.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                    <AlertCircleIcon className="h-4.5 w-4.5 text-red-650 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-800">Overdue Reminders</p>
                      <p className="text-[11px] text-red-700/80 mt-0.5">
                        There are {overdueBorrowingsCount} books overdue. Contact students to settle outstanding balances.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2.5">
                    <CheckCircleIcon className="h-4.5 w-4.5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-green-800">Healthy Stock</p>
                      <p className="text-[11px] text-green-700/80 mt-0.5">
                        {availableBooksCount} out of {totalBooksCount} book copies are currently available in shelves.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        )}
      </Tabs>

      {/* Add Book Dialog */}
      <Dialog open={showAddBookDialog} onOpenChange={setShowAddBookDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Book</DialogTitle>
            <DialogDescription>Input the catalog metadata details of the book copy.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBook} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Book Title</Label>
              <Input
                id="title"
                placeholder="e.g. Higher Algebra"
                value={addBookTitle}
                onChange={(e) => setAddBookTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author">Author Name</Label>
              <Input
                id="author"
                placeholder="e.g. Hall & Knight"
                value={addBookAuthor}
                onChange={(e) => setAddBookAuthor(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="isbn">ISBN Code</Label>
                <Input
                  id="isbn"
                  placeholder="e.g. 978-3-16-148410-0"
                  value={addBookIsbn}
                  onChange={(e) => setAddBookIsbn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Total Copies</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={addBookQuantity}
                  onChange={(e) => setAddBookQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowAddBookDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Add Book'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Issue Book</DialogTitle>
            <DialogDescription>Lend a book copy to a student registered in the school catalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueBook} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="student">Select Student</Label>
              <Select value={issueStudentId} onValueChange={setIssueStudentId}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.className} • Roll: {student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="book">Select Book</Label>
              <Select value={issueBookId} onValueChange={setIssueBookId}>
                <SelectTrigger id="book">
                  <SelectValue placeholder="Choose book" />
                </SelectTrigger>
                <SelectContent>
                  {books
                    .filter((b) => b.available > 0)
                    .map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} (Available: {book.available} copies)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowIssueDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Processing...' : 'Issue Book'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
