import { OnInit } from '@angular/core';
import { Service } from '@wiz/libs/portal/season/service';

export class Component implements OnInit {
    public stats: any[] = [];
    public recentItems: any[] = [];
    public loading: boolean = true;

    constructor(public service: Service) { }

    public async ngOnInit() {
        await this.service.init();
        await this.service.auth.allow("/access");
        await this.load();
    }

    public async load() {
        this.loading = true;
        await this.service.render();

        const { code, data } = await wiz.call("overview");
        if (code === 200) {
            this.stats = data.stats || [];
            this.recentItems = data.recent || [];
        }

        this.loading = false;
        await this.service.render();
    }

    public statusLabel(status: string): string {
        const labels: any = {
            published: '공개',
            draft: '임시저장',
            archived: '보관'
        };
        return labels[status] || '미정';
    }
}
