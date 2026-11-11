# Component cheat sheet

All HouseCue (HC/*) components in `src/components/<Name>/<Name>.tsx`. Each has stories in Storybook (`npm run storybook`, port 6008) linked to its Figma node. Read the component file when you need the exact prop types.

## Foundations
- **Icon** `{ name: IconName, size?: 16|20|24|28|36, label? }` — 37 icons: account, calendar, caution, chat, check, checkbox, checkbox-checked, close, close-small, credit-card, dashboard, data, delete, devices, document, dollar-sign, email, error, help, home, in-process, information, location, lock, notification, orders, plus, rating-hollow, review, schedule, search, service, shield, star, success, tasks, users, visibility. Colour = currentColor.
- **Logo** `{ type?: 'horizontal'|'symbol', color?: 'auto'|'light'|'dark'|'mono', height? }`

## Forms
- **Button** `{ variant?: 'primary'|'secondary'|'tertiary'|'destructive'|'link', size?: 'small'|'medium'|'large', leadingIcon?, trailingIcon?, icon? (icon-only, needs aria-label), loading?, fullWidth?, to? }` + button attrs. Medium 44 default; Large 52 for onboarding/hero CTAs.
- **Input** `{ label, hideLabel?, type?: 'text'|'email'|'phone'|'number'|'code'|'search'|'multiline', size?: 'medium'|'large', helper?, error?, value?/defaultValue?, onValueChange?, leadingIcon?, trailingAction?, rows? }` + input attrs (readOnly, disabled).
- **Select** `{ label, hideLabel?, options: {value,label,disabled?}[], placeholder?, value?/defaultValue?, onValueChange?, size?, helper?, error? }`
- **CodeEntry** `{ label?, helper?, error?, length?=6, value?/defaultValue?, onValueChange?, onComplete? }`
- **Checkbox** `{ label?, hideLabel?, indeterminate?, error? }` + checkbox attrs
- **Radio** `{ label?, error? }` + radio attrs (group with `name`)
- **Switch** `{ label?, switchPosition?: 'start'|'end', checked?/defaultChecked?, onCheckedChange?, disabled? }` (also covers HC/Toggle)
- **SettingRow** `{ title, description?, checked?/defaultChecked?, onCheckedChange?, disabled? }`
- **ConsentRow** `{ children, required?=true, checked?/defaultChecked?, onChange?, error?, linkLabel?='Read', linkHref?, onLinkClick? }`
- **NumberStepper** `{ title, helper?, value?/defaultValue?, onValueChange?, min?, max?, step? }`
- **Upload** `{ state?: 'idle'|'dragging'|'uploading'|'done'|'error', onFiles?, accept?, hint?, fileName?, progress?, meta?, onCancel?, onReplace?, errorTitle?, errorMessage?, onRetry? }`

## Feedback
- **StatusPill** `{ label, tone?: 'neutral'|'info'|'success'|'warning'|'danger' }` — tone defaults from the label via `toneForLabel(label)`.
- **Banner** `{ tone?: 'info'|'success'|'warning'|'error', title?, children }`
- **StateBlock** `{ kind?: 'empty'|'error', title, body?, actionLabel?, onAction?, icon? }` — empty/error state frames.
- **SkeletonCard** `{ avatar?=true, label? }` — loading state frames (stack 3–4).
- **DisclosureNote** `{ variant?: 'note'|'info-icon', children?, learnMoreLabel?, onLearnMore?, onDismiss? }`
- **MembersLock** `{ title?, body?, actionLabel?='Upgrade', onAction?, to? }`

## Navigation (screens normally get these through `MobileShell` / `WebShell`)
- **StatusBar**, **HomeHeader**, **TabBar** (`role`, `active`, `paths`), **VendorTabBar**, **WebTopBar** (`type: 'onboarding'|'marketing'`), **WebSideNav** (`role`, `active`), **VendorWebSideNav**, **ConsoleSideNav**, **ConsoleBreadcrumb** `{ parent, current }`.
- **AppBar** `{ title, showBack?=true, backTo?, onBack?, step?, action?: ReactNode, progress?: 0–1 }` — onboarding steps show `step` ("2 of 7") and `progress`.
- **BottomActions** `{ primaryLabel, primaryTo?, onPrimary?, primaryDisabled?, primaryLoading?, secondaryLabel?, onSecondary?, showHomeIndicator? }` — pass as `MobileShell bottom`.
- **AgentFab** `{ size?: 'compact'|'extended', label?, to?, onClick? }` — landlord screens place it themselves (bottom-right).
- **PushCard** `{ meta, title, body }` — notification previews.

## Content
- **AgentCard** `{ name?, children }` — agent speech bubble with the HouseCue symbol (also used in C09 chat).
- **UserBubble** `{ children }` — user chat message.
- **OptionCard** `{ title, description?, icon?, selected? }` + button attrs; put cards in a `role="radiogroup"`.
- **ImagePlaceholder** `{ label, height?=200 }`
- **DetailRow** `{ label, value, actionLabel?='Edit', onAction?, actionTo? }`
- **ListRow** `{ title, description?, icon?='check' }`
- **TaskRow** `{ title, meta?, icon?, tag?, tagTone?, onClick?, to? }`
- **ActionCard** `{ title, body?, meta?, status?, approveLabel?, editLabel?, rejectLabel?, onApprove?, onEdit?, onReject? }` — agent "needs your OK" card.
- **SetupChecklist** `{ title, completed, total, items: {id?,label,meta?,done?,onClick?}[], seeAllLabel?, onSeeAll? }`
- **TimelineStep** `{ state: 'done'|'current'|'upcoming', title, meta? }` — renders `<li>`; wrap in `<ol>`.
- **ChangeOrderCard** `{ title, body?, meta?, status?, approveLabel?, declineLabel?, onApprove?, onDecline? }`
- **HoldExplainer** `{ title, steps: ReactNode[] }`
- **StatTile** `{ label, value, meta? }`
- **MetricRow** `{ label, value }`

## Quotes and money
- **QuoteRow** `{ network?: 'in-network'|'out-of-network', vendor, price, trustScore?, rating?, reviews?, nearby?, onNearbyClick?, details?, updated?, chooseLabel?, profileLabel?, onChoose?, onProfile? }`
- **QuoteStandingPanel** `{ state: 'standing'|'below-floor'|'locked'|'final-lost'|'final-won', metrics?, engagementTier?, … }` (vendor side)
- **CreditsMeter** `{ plan?: 'member'|'free', size?: 'full'|'compact', balance, level?, allowance?, note?, actionLabel?, onAction? }`
