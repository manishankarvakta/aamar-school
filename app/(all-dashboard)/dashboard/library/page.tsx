'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  SearchIcon,
  BookOpenIcon,
  UsersIcon,
  RotateCcwIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  EyeIcon,
  DownloadIcon,
  BookIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
} from 'lucide-react';

// Sample data
const bookData = [
  {
    id: 1,
    isbn: '978-0-123456-78-9',
    title: 'Advanced Mathematics',
    author: 'Dr. John Smith',
    category: 'Mathematics',
    publisher: 'Academic Press',
    totalCopies: 15,
    availableCopies: 12,
    borrowedCopies: 3,
    location: 'Section A - Shelf 2',
    status: 'Available'
  },
  {
    id: 2,
    isbn: '978-0-987654-32-1',
    title: 'Physics Fundamentals',
    author: 'Prof. Sarah Johnson',
    category: 'Physics',
    publisher: 'Science Books Ltd',
    totalCopies: 10,
    availableCopies: 7,
    borrowedCopies: 3,
    location: 'Section B - Shelf 1',
    status: 'Available'
  },
  {
    id: 3,
    isbn: '978-0-456789-12-3',
    title: 'World History',
    author: 'Michael Brown',
    category: 'History',
    publisher: 'Historical Publications',
    totalCopies: 8,
    availableCopies: 0,
    borrowedCopies: 8,
    location: 'Section C - Shelf 3',
    status: 'Out of Stock'
  }
];

const borrowedBooks = [
  {
    id: 1,
    bookTitle: 'Advanced Mathematics',
    studentName: 'Alice Johnson',
    studentId: 'STD2024001',
    class: 'Grade 10',
    borrowDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'Borrowed',
    fine: 0,
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    bookTitle: 'Physics Fundamentals',
    studentName: 'Michael Chen',
    studentId: 'STD2024002',
    class: 'Grade 10',
    borrowDate: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'Overdue',
    fine: 50,
    photo: '/api/placeholder/40/40'
  }
];

const categories = ['All Categories', 'Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Geography', 'Biology'];

export default function LibraryPage() {
  const [selectedTab, setSelectedTab] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);

  const stats = [
    { title: 'Total Books', value: '2,847', icon: BookIcon, color: 'blue' },
    { title: 'Available Books', value: '2,234', icon: BookOpenIcon, color: 'green' },
    { title: 'Borrowed Books', value: '456', icon: UserIcon, color: 'yellow' },
    { title: 'Overdue Books', value: '23', icon: AlertCircleIcon, color: 'red' },
  ];

  const filteredBooks = bookData.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Categories' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Borrowed': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Library Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage books, track borrowing, and maintain library records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddBookDialog(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Book
          </Button>
          <Button onClick={() => setShowIssueDialog(true)} variant="outline" className="gap-2">
            <BookOpenIcon className="h-4 w-4" />
            Issue Book
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Details</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Copies</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                        </div>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Available: {book.availableCopies}</p>
                          <p className="text-muted-foreground">Total: {book.totalCopies}</p>
                        </div>
                      </TableCell>
                      <TableCell>{book.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(book.status)}>
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Book
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BookOpenIcon className="h-4 w-4 mr-2" />
                              Issue Book
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Book
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
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
                  {borrowedBooks.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.photo} />
                            <AvatarFallback>{item.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.studentName}</p>
                            <p className="text-sm text-muted-foreground">{item.class} • {item.studentId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.bookTitle}</TableCell>
                      <TableCell>{item.borrowDate}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.fine > 0 ? (
                          <span className="text-red-600 font-semibold">৳{item.fine}</span>
                        ) : (
                          <span className="text-green-600">No Fine</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <RotateCcwIcon className="h-4 w-4 mr-2" />
                              Return Book
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Extend Due Date
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Library Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Member management functionality will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookData.slice(0, 3).map((book) => (
                    <div key={book.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <span className="text-sm font-semibold">{book.borrowedCopies} borrowed</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(1, 4).map((category) => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{category}</span>
                      <span className="font-semibold">{Math.floor(Math.random() * 200) + 50}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export Library Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    Overdue Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showAddBookDialog} onOpenChange={setShowAddBookDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Enter book title" />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input placeholder="Enter author name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ISBN</Label>
                <Input placeholder="Enter ISBN" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddBookDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddBookDialog(false)}>Add Book</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std1">Alice Johnson - Grade 10</SelectItem>
                  <SelectItem value="std2">Michael Chen - Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Book</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose book" />
                </SelectTrigger>
                <SelectContent>
                  {bookData.filter(book => book.availableCopies > 0).map((book) => (
                    <SelectItem key={book.id} value={book.id.toString()}>
                      {book.title} - {book.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowIssueDialog(false)}>Issue Book</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
