import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/modules/security/models/user';
import { AuthService } from 'src/app/modules/security/services/auth.service';

@Component({
  selector: 'sic-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user!: User;
  canSeeAdminPanel: boolean = false;
  @Input() watchUser!: boolean;
  @Output() resultWatch = new EventEmitter<boolean>();

  // Permission
  canHideInfoUser!: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.canSeeAdminPanel = this.user.IsAdmin;
    this.canHideInfoUser = this.authService.hasPermission('uviu1');
  }

  logout() {
    this.authService.logout().subscribe((_) => {
      this.router.navigate(['/login']);
    });
  }
  
  toggleUserInfo() {
    this.watchUser = !this.watchUser;
    this.resultWatch.emit(this.watchUser);
  }

  goAdminPanel() {
    this.router.navigate(['/admin-panel']);
  }
}
