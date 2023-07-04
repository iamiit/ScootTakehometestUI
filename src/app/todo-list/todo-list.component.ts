import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../todo-list/models/todo.model';
import { TodoService } from '../todo-list/services/todoServices';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  newTodoID:any;
  newTodoDescription: string = '';
  newTodoDueDate: string = '';
  newTodoPriority: string = '';
  showInputForm: boolean = false;
  showInputFormEdit: boolean = false;
  successMessage: string = ''


  todos: any[] = []; // TODO items array
  filteredTodos: any[] = []; // Filtered TODO items array
  filterText = ''; // Filter text input
  currentPage = 1; // Current page number
  itemsPerPage = 10; // Number of items per page

filterType = 'description'; // Filter type: description or priority

  constructor(private http: HttpClient,
    private todoService: TodoService) { }

  ngOnInit() {
    this.fetchTodos();
  }

  fetchTodos(): void {
    this.http.get<any[]>('http://localhost:3000/api/todos').subscribe(
      (response: any[]) => {
        this.todos = response;
        this.filterTodos();
      },
      (error: any) => {
        console.error('Error fetching TODO items:', error);
      }
    );
  }

  filterTodos(): void {
    this.filteredTodos = this.todos.filter(todo => {
      const filterValue = this.filterText.toLowerCase();
      if (this.filterType === 'description') {
        return todo.description && todo.description.toLowerCase().includes(filterValue);
      } else if (this.filterType === 'priority') {
        return todo.priority && todo.priority.toLowerCase().includes(filterValue);
      }
      return false;
    });
  }
  
  get paginatedTodos(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTodos.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTodos.length / this.itemsPerPage);
  }

  toggleInputForm(): void {
    this.showInputForm = !this.showInputForm;
  }

  toggleInputFormEdit(res: any): void {
    this.newTodoID = res.id;
    this.newTodoDescription = res.description;
    this.newTodoDueDate = res.dueDate;
    this.newTodoPriority = res.priority;
    this.showInputFormEdit = !this.showInputFormEdit;
  }

  addTodo(): void {
    const newTodo: Todo = {
      description: this.newTodoDescription,
      dueDate: this.newTodoDueDate,
      priority: this.newTodoPriority
    };

    this.todoService.addTodo(newTodo)
      .subscribe(todo => {
        // Todo added successfully, do something if needed
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'New Item Added to the list successfully',
          showConfirmButton: false,
          timer: 1500
        });

        // Reset the form values
        this.newTodoDescription = '';
        this.newTodoDueDate = '';
        this.newTodoPriority = '';
        this.showInputForm = false;
        this.fetchTodos();

      }, error => {
        // Handle the error if occurred
        console.error('Error adding Todo:', error);
      });
  }

  editTodo(): void {
    const todo: Todo = {
      id: this.newTodoID,
      description: this.newTodoDescription,
      dueDate: this.newTodoDueDate,
      priority: this.newTodoPriority
    };
  
    this.todoService.editTodo(todo).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Data Updated Successful!',
          text: 'The operation was successfully updated.',
          showConfirmButton: false,
          timer: 1500
        });
        
        this.fetchTodos();
        this.showInputFormEdit = false;
        this.resetForm();
      },
      (error: any) => {
        console.error('Failed to edit todo:', error);
      }
    );
  }

  deleteTodo(todoId: string): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to delete it?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.todoService.deleteTodo(todoId).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Delete Successful!',
              text: 'The operation was successfully deleted.',
              showConfirmButton: false,
              timer: 1500
            });
            this.fetchTodos();
          },
          error => {
            console.error('Failed to delete todo:', error);
          }
        );
      }
    });
}

  cancelAddTodo(): void {
    this.showInputForm = false;
    this.showInputFormEdit = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newTodoDescription = '';
    this.newTodoDueDate = '';
    this.newTodoPriority = '';
  }


}
