import { createSignal } from 'solid-js'
import styles from './MenuItem.css'

function MenuItem(props) {
    function onSelect(e) { }
    return (
        <li class="menu-item clickable-item">
            <h3 class={props.item.folder ? 'clickable' : ''} onclick={onSelect}>
                {props.item.title}
            </h3>
            <Show when={props.item.sub_chapters && props.item.sub_chapters.length > 0}>
                <ul>
                    <For each={props.item.sub_chapters}>
                        {(item, i) =>
                            <MenuItem
                                key={item.title}
                                item={item}>
                            </MenuItem>}
                    </For>
                </ul>
            </Show>
        </li >
    )
}

export default MenuItem
