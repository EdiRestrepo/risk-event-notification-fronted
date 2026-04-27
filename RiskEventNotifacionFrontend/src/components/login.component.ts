import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // 1. Importa esto
import { TmplAstIdleDeferredTrigger } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule], // 2. Agrégalo aquí
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log("bien ", res);
          alert('¡Bienvenido! El acceso es correcto.'); // Modal sencillo
          //localStorage.setItem('token', res.token); // Guardamos el token
          alert('Éxito: ' + res); // Aquí verás el mensaje que viene de .NET
        
        // Como la API solo devuelve un mensaje y no un token, 
        // simulamos que el login fue exitoso para navegar
          localStorage.setItem('login_status', 'success');
          this.router.navigate(['/dashboard']); // Vamos al menú
        },
        error: (err) => {
          console.log("error ", err);
          alert('Credenciales incorrectas')
        }
      });
    }
  }
}