# Blueberri

## Summary

Tool to aggregate specific github stats about a repository. In active development. More docs incoming soon...


## How to run:

1. You must first get a github api token, and set it in either a `.env` at the root of the repository as  `API_TOKEN`, or `export API_TOKEN=`.

2. Run

```bash
$ yarn install
$ yarn start -o <org_name> -r <repo_name> -s 2024-03-25
```

Options:
      --help        Show help                                              [boolean]
      --version     Show version number                                    [boolean]
  -o, --org         The org that owns the repository                        [string]
  -r, --repo        The repository to query                                 [string]
  -s, --start-date  Expects a date in ISO format                            [string]
  -e, --end-date    Expects a date in ISO format                            [string]
  -w, --write       Path to write the data too                              [string]
  -c, --config      Path to config. Relative to where the script it called. [string]

  NOTE: org, repo, and start-date are required.
