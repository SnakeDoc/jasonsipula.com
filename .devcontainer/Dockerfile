FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04@sha256:d94c97dd9cacf183d0a6fd12a8e87b526e9e928307674ae9c94139139c0c6eae

ARG USER=vscode

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# install fish shell from ppa
RUN curl -sSL --retry 3 \
    https://raw.githubusercontent.com/meaningful-ooo/devcontainer-features/main/src/fish/install.sh \
    | FISHER=false bash && \
    mkdir -p /home/${USER}/.config/fish/completions && \
    chown -R ${USER}:${USER} /home/${USER}/.config/fish && \
    chsh --shell /usr/bin/fish ${USER}

# install starship shell prompt
RUN curl -sSL --retry 3 https://starship.rs/install.sh | sh -s -- -y && \
    mkdir -p /home/${USER}/.config && \
    touch /home/${USER}/.config/starship.toml && \
    starship preset nerd-font-symbols -o /home/${USER}/.config/starship.toml && \
    touch /home/${USER}/.config/fish/config.fish && \
    echo "starship init fish | source" >> /home/${USER}/.config/fish/config.fish && \
    chown -R ${USER}:${USER} /home/${USER}/.config

# install the latest asdf package manager
RUN mkdir -p /home/${USER}/.asdf/bin && \
  git ls-remote --tags https://github.com/asdf-vm/asdf.git | \
  grep -o 'refs/tags/v[0-9]*\.[0-9]*\.[0-9]*$' | \
  sed 's/refs\/tags\///' | \
  sort -V | \
  tail -n1 | \
  xargs -I {} curl -sSL --retry 3 https://github.com/asdf-vm/asdf/releases/download/{}/asdf-{}-linux-amd64.tar.gz | \
  tar -xzf - -C /home/${USER}/.asdf/bin && \
  chown -R "${USER}:${USER}" "/home/${USER}/.asdf" && \
  # set up asdf in bash and fish shells, including completions
  echo "export PATH='${ASDF_DATA_DIR:-/home/${USER}/.asdf}/bin:$PATH'" >> /home/${USER}/.bashrc && \
  echo "set -gx PATH (set -q ASDF_DATA_DIR && echo $ASDF_DATA_DIR || echo /home/${USER}/.asdf)/bin $PATH" >> /home/${USER}/.config/fish/config.fish && \
  echo "export PATH='${ASDF_DATA_DIR:-/home/${USER}/.asdf}/shims:$PATH'" >> /home/${USER}/.bash_profile && \
  echo "if not contains /home/${USER}/.asdf/shims $PATH; set -gx --prepend PATH /home/${USER}/.asdf/shims; end" >> /home/${USER}/.config/fish/config.fish && \
  echo ". <(asdf completion bash)" >> /home/${USER}/.bashrc && \
  export PATH="/home/${USER}/.asdf/bin:$PATH" && \
  asdf completion fish > /home/${USER}/.config/fish/completions/asdf.fish

# create helper script for installing asdf plugins and tools from .tool-versions
# uses a checksum file to avoid running asdf if .tool-versions hasn't changed
RUN mkdir -p /home/${USER}/.local/bin && \
    install -m 0755 /dev/stdin /home/${USER}/.local/bin/install-asdf-tools <<'FISH'
#!/usr/bin/env fish

if not test -f .tool-versions
  echo "No .tool-versions file found; skipping asdf tools installation."
  exit 0
end

mkdir -p ~/.cache
set -l cache ~/.cache/asdf-autoinstall.sha256
set -l cur (sha256sum .tool-versions | awk '{print $1}')
set -l prev (test -f $cache; and cat $cache; or echo '')

if test "$cur" != "$prev"
  for line in (cat .tool-versions)
    set -l plugin (echo $line | awk '{print $1}')
    if test -n "$plugin"; and not string match -q '#*' $plugin
      if not test -d ~/.asdf/plugins/$plugin
        echo "Installing asdf plugin: $plugin"
        asdf plugin add $plugin 2>/dev/null; or true
      end
    end
  end

  echo "Installing tools from .tool-versions..."
  asdf install; and echo $cur > $cache
end
FISH

# auto-install asdf plugins and tools at startup and new shell sessions
# uses a sentinel environment variable to avoid potential recursion loops
RUN install -d /home/${USER}/.config/fish/conf.d && \
  install -m 0644 /dev/stdin /home/${USER}/.config/fish/conf.d/05-asdf-plugins.fish <<'FISH'
if not set -q __ASDF_TOOLS_INSTALLING
  set -gx __ASDF_TOOLS_INSTALLING 1
  ~/.local/bin/install-asdf-tools
  set -e __ASDF_TOOLS_INSTALLING
end
FISH

# fix permissions
RUN chown -R ${USER}:${USER} /home/${USER}

USER ${USER}

# install asdf plugins and default packages
#
# copy the default .tool-versions file
COPY --chown=${USER}:${USER} --chmod=644 ./.tool-versions /home/${USER}/.tool-versions
# install plugins and tools, then cleanup asdf downloads and cache
WORKDIR /home/${USER}
RUN fish ~/.local/bin/install-asdf-tools && \
    rm -rf ~/.asdf/downloads && \
    rm -rf ~/.cache

# pre-install playwright because it's huge and takes forever to install on first run
RUN PATH="/home/${USER}/.asdf/bin:/home/${USER}/.asdf/shims:$PATH" && \
    npx playwright install --with-deps

# start fish shell
ENTRYPOINT ["/usr/bin/fish"]
