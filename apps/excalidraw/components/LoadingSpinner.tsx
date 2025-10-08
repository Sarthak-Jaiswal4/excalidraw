import {
    Item,
    ItemContent,
    ItemMedia,
    ItemTitle,
  } from "@/components/ui/item"
  import { Spinner } from "@/components/ui/spinner"
  
  export function SpinnerDemo({title}:{title:string}) {
    return (
      <div className="flex w-full max-w-xs flex-col gap-4 rounded-full">
        <Item variant="muted" className="rounded-full">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">{title}</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    )
  }
  