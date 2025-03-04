import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/modules/security/models/user';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { UserService } from '../../admin-panel/services/user.service';
import { ToolPermission } from '../../admin-panel/models/tool-permission';

@Component({
  selector: 'sic-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  hidePassword = true;
  loginForm: FormGroup;
  loginError: string = '';
  hasError: boolean = false;
  isDefaultUser: boolean = false;

  backdropMessage: string = 'Iniciando sesión...';
  showLoading: boolean = false;

  constructor(
    private formBuild: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.loginForm = this.formBuild.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.router.navigate([`/map`]);
    }
  }

  getErrorMessage(control: string): string {
    if (this.loginForm.get(control)?.hasError('required')) {
      return `Este campo no puede estar vacío.`;
    }
    return '';
  }

  onSubmit(): void {
    if(this.isDefaultUser){
      this.loginForm.setValue({ username: ' ', password: ' ' });
    }
    if (this.loginForm.valid) {
      this.showLoading = true;
      this.authService.login(this.loginForm.value).subscribe((_result: User) => {
        this.userService.getUserPermissions().subscribe((permissions: ToolPermission[])=> {
          this.authService.savePermissions(permissions);
          this.showLoading = false;
          this.router.navigate(['/map']);
        }, (e) => {
          this.hasError = true;
          this.loginError = e.message;
          this.showLoading = false;
        });
      }, (error) => {
        this.hasError = true;
        this.loginError = error.message;
        this.showLoading = false;
      });
    }
  }

  reset() {
    this.loginError = '';
    this.hidePassword = true;
    this.hasError = false;
  }
}
