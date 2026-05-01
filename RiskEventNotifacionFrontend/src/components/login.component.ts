import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log("Login exitoso: ", res);

          // Guardar información del usuario en localStorage
          localStorage.setItem('login_status', 'success');
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);

          // Navegación con delay para efecto visual
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Credenciales incorrectas. Intenta de nuevo.';
          this.cdr.detectChanges();
          console.error("Error de autenticación: ", err);
        }
      });
    }
  }
}

