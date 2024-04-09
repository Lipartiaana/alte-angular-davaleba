import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, map, switchMap, takeUntil, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
})
export class UserCreateComponent implements OnDestroy {
  userService = inject(UserService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  form = new FormGroup({
    id: new FormControl<string | undefined | null>(null),
    firstName: new FormControl<string>('', Validators.required),
    lastName: new FormControl<string>('', Validators.required),
    birthDate: new FormControl<string>('', Validators.required),
    phone: new FormControl<string>('', Validators.required),
  });

  user$ = this.route.params.pipe(
    map((params) => params['id']),
    switchMap((id) =>
      this.userService.getUser(id).pipe(
        tap((user: User) => {
          if (!user) return;
          this.form.patchValue(user);
        })
      )
    )
  );

  sub$ = new Subject();

  submit() {
    console.log(this.form.value);
    if (this.form.invalid) {
      return;
    }

    const { id, firstName, lastName, birthDate, phone } = this.form.value;

    if (id) {
      this.userService
        .updateUser({
          id,
          firstName,
          lastName,
          birthDate,
          phone,
        } as User)
        .pipe(takeUntil(this.sub$))
        .subscribe((res) => {
          this.router.navigate(['/']);
        });
    } else {
      const randomId = Math.floor(Math.random() * 10000);
      const user = {
        id: String(randomId),
        firstName,
        lastName,
        birthDate,
        phone,
      } as User;
      this.userService
        .createUser(user)
        .pipe(takeUntil(this.sub$))
        .subscribe((res) => {
          this.router.navigate(['/']);
        });
    }
  }

  ngOnDestroy(): void {
    this.sub$.next(null);
    this.sub$.complete();
  }
}
