const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {
    
    // variables
    var dockerId = project.secrets.registryUsername
    var dockerPwd = project.secrets.registryPassword
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var image = "squillace/golang"
    var gitSHA = brigadeEvent.revision.commit.substr(0,7)
    var imageTag = String(gitSHA)

    console.log("ID: " + dockerId)
    console.log("Password: " + dockerPwd)
    console.log(`==> gitHub webook with commit ID ${gitSHA}`)

    // setup container build brigade job
    var docker = new Job("job-runner-docker")
    docker.storage.enabled = false
    docker.privileged = true
    docker.image = "chzbrgr71/dockernd:golang"
    docker.tasks = [
        "dockerd-entrypoint.sh &",
        "echo waiting && sleep 20",
        `cd /src/golang/`,
        `docker login -u ${dockerId} -p ${dockerPwd}`,
        `docker build -t ${image}:${imageTag} .`,
        `docker push ${image}:${imageTag}`,
        "killall dockerd"
    ]

    // brigade job. Helm chart
    var helm = new Job("job-runner-helm")
    helm.storage.enabled = false
    helm.image = "lachlanevenson/k8s-helm:v2.8.2"
    helm.tasks = [
        `helm upgrade --install --reuse-values golang-prod ./src/golang/charts/go-prod --set image.repository=${image} --set image.tag=${imageTag} --namespace=default`
    ]

    var pipeline = new Group()
    pipeline.add(docker)
    pipeline.add(helm)
    
    pipeline.runEach()
})

events.on("after", (event, project) => {
    
    var slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slack.storage.enabled = false
    slack.env = {
      SLACK_WEBHOOK: project.secrets.slackWebhook,
      SLACK_USERNAME: "brigade-demo",
      SLACK_MESSAGE: "KubeCon EU 2018 brigade pipeline finished (Brian Redmond was here)",
      SLACK_COLOR: "#0000ff"
    }
    
    slack.run()
})