const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {
    
    // variables
    var dockerId = project.secrets.registryUrl
    var dockerPwd = project.secrets.registryPassword
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var image = "squillace/golang"
    var gitSHA = brigadeEvent.revision.commit.substr(0,7)
    var imageTag = String(gitSHA)

    console.log("ID: " + dockerId)
    console.log("Password: " + dockerPwd)
    console.log(`==> gitHub webook with commit ID ${gitSHA}`)

    // Let's notice the event
    var slackJob = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slackJob.storage.enabled = false
    slackJob.env = {
      SLACK_WEBHOOK: project.secrets.slackWebhook,
      SLACK_USERNAME: "brigade-demo",
      SLACK_MESSAGE: "Detected a git push on " + image + " with commit hash " + imageTag,
      SLACK_COLOR: "#0000ff"
    }

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

    // Let's notice the event and test someting after the build.
    var slackJobTest1 = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slackJobTest1.storage.enabled = false
    slackJobTest1.env = {
      SLACK_WEBHOOK: project.secrets.slackWebhook,
      SLACK_USERNAME: "brigade-demo",
      SLACK_MESSAGE: "Docker build successful; running image test 1 ...",
      SLACK_COLOR: "#0000ff"
    }

    // Let's notice the event and test someting after the build.
    var slackJobTest2 = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slackJobTest2.storage.enabled = false
    slackJobTest2.env = {
      SLACK_WEBHOOK: project.secrets.slackWebhook,
      SLACK_USERNAME: "brigade-demo",
      SLACK_MESSAGE: "Running image test 2 ...",
      SLACK_COLOR: "#0000ff"
    }

    // Let's notice the event and test someting after the build.
    var slackJobTest3 = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slackJobTest3.storage.enabled = false
    slackJobTest3.env = {
      SLACK_WEBHOOK: project.secrets.slackWebhook,
      SLACK_USERNAME: "brigade-demo",
      SLACK_MESSAGE: "Test completed successfully. Deploying to Production...",
      SLACK_COLOR: "#0000ff"
    }

    // brigade job. Helm chart
    var helm = new Job("job-runner-helm")
    helm.storage.enabled = false
    helm.image = "lachlanevenson/k8s-helm:v2.8.2"
    helm.tasks = [
        `helm upgrade --install --reuse-values golang-prod ./src/golang/charts/go-prod --set image.repository=${image} --set image.tag=${imageTag} --namespace=default`
    ]

    var pipeline = new Group()
    pipeline.add(slackJob)
    pipeline.add(docker)
    //pipeline.add(slackJobTest1)
    //pipeline.add(slackJobTest2)
    pipeline.add(helm)
    
    pipeline.runEach()
})

events.on("after", (event, project) => {
    
    var slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slack.storage.enabled = false
    slack.env = {
      SLACK_WEBHOOK: project.secrets.slackWebhook,
      SLACK_USERNAME: "brigade-demo",
      SLACK_MESSAGE: "Brigade pipeline finished",
      SLACK_COLOR: "#0000ff"
    }
    
    slack.run()
})