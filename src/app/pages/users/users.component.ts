import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  userService: UserService = inject(UserService);

  users$ = this.userService.getUsers();

  delete(id: string) {
    this.userService.deleteUser(id).subscribe((res) => {
      this.users$ = this.userService.getUsers();
    });
  }
}
