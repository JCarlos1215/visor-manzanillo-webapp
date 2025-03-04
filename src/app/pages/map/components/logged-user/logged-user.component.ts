import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/modules/security/models/user';
import { AuthService } from 'src/app/modules/security/services/auth.service';

@Component({
  selector: 'sic-logged-user',
  templateUrl: './logged-user.component.html',
  styleUrls: ['./logged-user.component.scss']
})
export class LoggedUserComponent implements OnInit {
  user!: User;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

}
