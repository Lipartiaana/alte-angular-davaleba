import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, map, switchMap, takeUntil, tap } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgFor, NgIf],
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
    address: new FormGroup({
      city: new FormControl<string | undefined | null>(''),
      street: new FormControl<string | undefined | null>(''),
    }),
    skills: new FormArray([
      new FormGroup({
        skill: new FormControl<string | undefined | null>(''),
      }),
    ]),
    workExperience: new FormArray([
      new FormGroup({
        place: new FormControl(''),
        position: new FormControl(''),
        years: new FormControl(''),
      }),
    ]),
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
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const {
      id,
      firstName,
      lastName,
      birthDate,
      phone,
      address,
      skills,
      workExperience,
    } = this.form.value;

    if (id) {
      this.userService
        .updateUser({
          id,
          firstName,
          lastName,
          birthDate,
          phone,
          address,
          skills,
          workExperience,
        } as User)
        .pipe(takeUntil(this.sub$))
        .subscribe((res) => {
          console.log(this.skills);
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
        address,
        skills,
        workExperience,
      } as User;

      this.userService
        .createUser(user)
        .pipe(takeUntil(this.sub$))
        .subscribe((res) => {
          this.router.navigate(['/']);
        });
    }
  }

  get skills() {
    return this.form.get('skills') as FormArray;
  }

  get workExperience() {
    return this.form.get('workExperience') as FormArray;
  }

  addSkill() {
    const newControl = new FormGroup({
      skill: new FormControl(''),
    });
    this.skills.push(newControl);
  }

  removeSkill(i: number) {
    this.skills.removeAt(i);
  }

  addExperience() {
    const newControl = new FormGroup({
      place: new FormControl(''),
      position: new FormControl(''),
      years: new FormControl(''),
    });
    this.workExperience.push(newControl);
  }

  removeExperience(i: number) {
    this.workExperience.removeAt(i);
  }

  ngOnDestroy(): void {
    this.sub$.next(null);
    this.sub$.complete();
  }
}
