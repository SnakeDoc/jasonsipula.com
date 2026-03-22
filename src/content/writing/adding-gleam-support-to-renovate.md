---
title: "Adding Gleam Support to Renovate"
description:
  "How contributing one feature led to learning Rust, contributing to Gleam, and working across two major open source
  projects."
tags: ["gleam", "renovate", "rust", "typescript", "open source"]
date: 2026-03-11
draft: false
---

## Finding Gleam

My journey with the [Gleam programming language](https://gleam.run/) began in the early part of 2024, after searching
for a language that was new to both me and my co-founder for a startup we were building at the time. The reasons we
decided to use Gleam are the subject for future writing, but let’s just say Gleam is a very elegant language to read and
write - and we were hooked right away. Gleam is a relatively new language with v0.1 released in 2019, so its ecosystem
of libraries, frameworks, and tooling is young.

## Enter Renovate

At the time, I was much more accustomed to well-developed, mature languages and ecosystems, such as those supporting
Java/Kotlin and the Node universe - which meant I took for granted tools like [Renovate](https://docs.renovatebot.com/).
Renovate is an open source automated dependency management tool that I use on all of my projects. It monitors your
dependencies, opens pull requests for updates, runs them through your CI pipeline, and auto-merges if everything passes.
It’s a popular, platform-agnostic alternative to GitHub’s Dependabot, and boasts over 21k stars at the time of writing
this.

## The problem

After working with Gleam for a short while, it became obvious dependency management was something that should be
automated sooner rather than later. Some libraries and frameworks were releasing several times a month, and others even
more often. This meant keeping up to date was quickly eating into time I could have spent on new features and more
productive work. Delaying updates meant potentially missing deprecations and winding up with surprise breaking changes,
creating unplanned work and more hassle. I needed an automated solution - but none existed. Neither Renovate nor
Dependabot supported Gleam, and neither did any other automated tooling. The only way to update Gleam dependencies was
to manually run a Gleam CLI command.

Frustrated by the lack of options, I decided to look into adding Gleam support to Renovate. “How hard could it be?”, I
remember thinking. And so the saga began…

## Gleam, meet Renovate

Digging into Pull Requests and Issues on Renovate’s GitHub, I discovered someone else had felt the same way, and even
took a stab at adding Gleam support! Shout out to [Christopher Dieringer](https://github.com/cdaringe), whose
contributions did the heavy lifting: enabling Renovate to natively run the Gleam CLI, building the initial extraction
and artifact support, adding test coverage, and writing documentation. He got the effort most of the way there.

I picked up where Christopher left off and ran with it. Over the course of the next few weeks, I dove deep into the
internals of Renovate, learning how it worked, how it was architected, how other languages were supported, and more.
Renovate is implemented in [TypeScript](https://www.typescriptlang.org/), and provides excellent documentation,
including historical design decisions, philosophy, and guides. It's a huge, complex project with many moving pieces, but
it's well architected for extensibility. Gleam runs on the Erlang VM
([BEAM](<https://en.wikipedia.org/wiki/BEAM_(Erlang_virtual_machine)>)) and uses [Hex](https://hex.pm/) for its package
registry, sharing that ecosystem with Erlang and Elixir. Renovate already had Hex support from its Elixir integration,
so the package data side was covered. What I needed to finish was the remaining Gleam-specific logic: completing the
dependency extraction from the package file (`gleam.toml`), adding range strategy support for pinning, widening, or
bumping versions, handling monorepo configurations, and addressing the outstanding code review feedback. All backed by
tests and documentation, of course. The heart and soul of a healthy project.

With everything in place, I opened a Pull Request
([renovatebot/renovate#30345](https://github.com/renovatebot/renovate/pull/30345)). I was quite nervous, having never
contributed to Renovate before - let alone a project of this scale and used by so many individuals and companies around
the world - the potential impact of getting things wrong was daunting. I didn’t know what to expect, or what sort of
feedback I would receive. It turns out the Renovate maintainers are top-tier, and were more than helpful in guiding me
through their process and review. After about a week of multiple review rounds, edits and tweaks - my first Renovate PR
was merged! Gleam support was finally official!

## Not so fast

Well, except for one minor thing… okay, maybe not so minor. Gleam’s CLI only had the ability to update _all_
dependencies - it could not update just a specific dependency. This meant Renovate could not create separate commits per
dependency update - something that is crucial for automation. Updating all dependencies in one go is fine for simple
projects, but it creates unclear commit history and when things break, it leaves the user digging through logs to figure
out which dependency is causing problems.

It was clear something would need to be done, but what? Gleam couldn’t do what Renovate needed, and manually editing the
Gleam lockfile (`manifest.toml`) seemed fragile. The solution, I realized, was to add individual package update support
to Gleam. So, I made the decision to ship the initial Gleam Renovate support as-is, and circle back in the future after
Gleam had this new capability - whenever that might be.

## Gleam, here I come

It turned out Gleam’s GitHub had an open Issue to add individual package update support, but no one had attempted to
implement this new feature. _“Great,”_ I thought. _“What did I get myself into!”_ I finish what I start, so I decided to
roll up my sleeves and tackle this too.

Gleam is a monorepo, written in the [Rust](https://rust-lang.org/) programming language, which combines a compiler,
language server, and CLI all in one codebase. Collectively this is known as the Gleam build tool. Having no prior Rust
experience, this was a significant mountain for me to climb. Not only did I need to learn a new language - I needed to
learn it well enough to contribute a new feature to another major open source project with over 21k stars! Gleam may be
a young language and ecosystem, but it has real traction and a lot of people depending on it.

I tackled crash courses and tutorials on Rust until I felt confident enough to stumble my way through. I also studied
the Gleam codebase extensively. I had no reference for what a well-written Rust codebase looked like, but the Gleam
source was remarkably easy to navigate and understand. Whether that’s the Rust language itself or the highly functional
approach the Gleam core team used, I’m not sure. Either way, I felt confident contributing much quicker than I expected.
I formed a plan in my head - how I was going to approach this feature and what I thought the implementation might look
like. My nerves were easing the more I studied the codebase - it was actually starting to look feasible for me to pull
off!

Publicly announcing my intention to implement this feature was the moment of no return - my personal ego and pride would
no longer allow me to back down and leave this for someone else. It was on.

The core challenge was figuring out which dependencies could be safely unlocked for update. A direct dependency could be
updated, and so could its transitive dependencies, but only if no other package also depended on them. Getting that
resolution logic right was the trickiest part of the implementation. I added tests to ensure the new feature was
well-behaved, wired up the CLI commands while ensuring backwards compatibility was maintained, and updated the docs.

The whole process took just a few weeks from first commit to opening a Pull Request
([gleam-lang/gleam#3602](https://github.com/gleam-lang/gleam/pull/3602)). Collaborating with the Gleam core team, and
particularly Gleam’s creator - [Louis Pilfold](https://github.com/lpil) - was a pleasure. Louis helped guide me through
some of the Rust pitfalls and “gotchas” I wasn’t experienced enough to avoid, and was instrumental in shaping how this
feature was to behave. Louis’ approach was similar to classical Test Driven Development - he clearly defined the
expected behavior but left the details up to me. It removed ambiguity, set clear expectations, and is a leadership model
I greatly appreciate.

Several rounds of reviews and changes later, the PR was merged and the new feature shipped! Gleam now could update
individual packages as well as everything all at once. Nice. Now, I just needed to close the loop with Renovate.

## Closing the loop

Heading back to Renovate, I knew what needed to be done: update the Gleam integration to use the new individual package
update command, remove the previous workarounds, and update tests and documentation.

Feeling more confident in my second go-around, I dove right in. The changes were implemented over two separate Pull
Requests ([renovatebot/renovate#31000](https://github.com/renovatebot/renovate/pull/31000) and
[renovatebot/renovate#31002](https://github.com/renovatebot/renovate/pull/31002)) - broken into logical changes, which
facilitated easier code review and increased confidence in potentially disruptive changes. The Renovate maintainers once
again were nothing but helpful, and were instrumental in guiding me through the process. Before long, both PRs were
merged and the new feature shipped! Gleam support in Renovate was now “feature complete”!

## But wait, there’s more

Shortly after the final contributions were shipped, I announced to the Gleam community that Renovate now supported
automated dependency updates for Gleam! The community was enthused, with many users adopting Renovate right away. I
added Renovate support to all of my Gleam projects, not only to “dog food” my own work, but also because I had finally
scratched my own itch. I no longer needed to bother with manually updating my Gleam dependencies and now would only be
notified if something could not be automatically updated. Very cool.

Months passed, and everything worked wonderfully. Well, until one morning I woke up to pings by a Gleam core maintainer
informing me Renovate was breaking his project - asking if I might know what was happening. It hadn’t really occurred to
me up until then, but I now had a responsibility to maintain Renovate’s Gleam support - particularly since so many
_other_ users were depending on it. Feeling the heat, I rolled out of bed and immediately went to my computer,
determined to resolve or mitigate the damage as quickly as possible.

As it turned out, the issue was not in any of the Renovate Gleam code - rather, there was a bug hidden in the Renovate
Hex code, which had lain in wait _for years_. Gleam projects, in certain circumstances, would hit an edge case causing a
regular expression (it’s _always_ regex) to only partially update a range of acceptable dependency versions - breaking
the package file (`gleam.toml`), causing the project’s build to fail. Yikes…

Thankfully the regular expression was easy to update, and I added tests to prevent this from ever happening again. My
Pull Request ([renovatebot/renovate#34717](https://github.com/renovatebot/renovate/pull/34717)) was reviewed and merged
within no time. Fix shipped, and happy Gleam users rejoiced. Weight off my shoulders, for a time at least.

At the time of writing this, Gleam is preparing changes to the package and lock files (`gleam.toml` and `manifest.toml`,
respectively) that will standardize `snake_case` formatting across these files, correcting earlier inconsistencies.
While this may be a minor change, and support for the old format will remain - albeit deprecated - I’ll need to update
Renovate’s Gleam support to handle the new format. Looks like I’m diving back in for a third round in the near future.

## Lessons

What started as frustration with manually updating a few Gleam packages turned into contributions across two languages,
two major projects, and two very different communities. I learned Rust along the way, which I didn't expect. I also
gained a much deeper appreciation for the work open source maintainers put in every day. It's often thankless, and the
software world runs on it. I'm glad I was able to give back a small piece of what I've benefited from, and I'm looking
forward to finding more ways to contribute.
