import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';


import { Mensaje } from '../inteface/mensaje.inteface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection!: AngularFirestoreCollection<Mensaje>;
  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(private afs: AngularFirestore, public authf: AngularFireAuth) {
    this.authf.authState.subscribe(user => {
      console.log('estado del usuario', user);
      if (!user) {
        return;
      }
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    })
  }


  login(provedor:string) {
    if (provedor === 'google') {
      this.authf.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }else if (provedor === 'facebook'){
      this.authf.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    }
  }

  logout() {
    this.usuario = {};
    this.authf.signOut();
  }

  cargarMensaje(): Observable<Mensaje[]> {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'asc').limitToLast(5));
    return this.itemsCollection.valueChanges().pipe(
      map((mensajes: Mensaje[]) => {
        // this.chats = []; inesaserio
        // for (let mensaje of mensajes){
        //   this.chats.unshift(mensaje);
        // }
        // return this.chats;
        this.chats = mensajes;
        return mensajes;
      })
    );

  }
  agregarMensaje(texto: string) {
    let mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }
    return this.itemsCollection.add(mensaje);
  }

}
