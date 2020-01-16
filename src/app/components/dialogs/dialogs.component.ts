import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.css']
})
export class DialogsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      dialogRef.disableClose = true;

     }

  ngOnInit() {  console.log(this.data)

  }

  onNoClick(): void {
    this.dialogRef.close({hola: 'chauuu'});
  }

}
