// place files you want to import through the `$lib` alias in this folder.
declare module 'svelte-icons/*' {
    import { SvelteComponentTyped } from 'svelte';
    export default class extends SvelteComponentTyped<any> {}
}
