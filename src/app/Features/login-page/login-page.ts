import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../Utils/FormUtils';
import { Router } from '@angular/router';

const USER = {
  email: 'usuario@ups.edu.ec',
  password: '123456',
};

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {

  FormUtils = FormUtils;

  form: ReturnType<FormBuilder['group']>;
  error: string | null = null;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.FormUtils.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    if (email === USER.email && password === USER.password) {
      this.router.navigate(['/home']);
    } else {
      this.error = 'Credenciales incorrectas';
    }
  }

 }
