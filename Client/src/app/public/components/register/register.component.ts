import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent{

  Form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required])
  })

  register() {}

  constructor() { }

  get email(): FormControl {
    return this.email.get('email') as FormControl;
  }
  get username(): FormControl {
    return this.username.get('username') as FormControl;
  }
  get password(): FormControl {
    return this.password.get('password') as FormControl;
  }
}
