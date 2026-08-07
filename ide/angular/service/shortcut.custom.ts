import Service from './service';
import { KeyMod, KeyCode } from 'monaco-editor';

export default class shortcut {
            constructor(private service: Service) { }

            public bind() {
                let service = this.service;
                let shortcuts = [];

                for (let i = 0 ; i < shortcuts.length ; i++) {
                    let name = shortcuts[i].name;
                    if(!name) continue;
                    this.service.shortcut.bind(name, shortcuts[i]);
                }
            }
        }
        
